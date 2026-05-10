import { ServerMCP, throwableToolCall, PAY_SCHEMA } from '@app/common/core/mcp';
import { TransactionType, TransactionReason } from '@app/common/enums/financial';
import { SagaState } from '@app/common/enums/essential';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// init_financial_transaction
// ------------------------------------------------------------

mcp.server.registerTool(
  'init_financial_transaction',
  {
    title: 'Initiate Financial Transaction',
    description:
      'Creates a saga + transaction in a single atomic call. Use this instead of calling create_essential_sagas and create_financial_transactions separately — this ensures the saga is properly linked before the transaction is created.\n\n' +
      '• Creates an EssentialSaga with job="financial-transaction"\n' +
      '• Creates a FinancialTransaction linked to that saga\n' +
      '• Returns { saga, transaction } — both objects with their generated ids\n\n' +
      'Required: type, reason, amount, and at least one payer or payee wallet.\n' +
      '📖 docs://service/financial-specification | docs://service/essential-specification',
    inputSchema: {
      headers: z.record(z.string(), z.string()).optional(),
      type: z.nativeEnum(TransactionType).describe('Transaction type (e.g. TRANSFER, DEPOSIT, WITHDRAWAL)'),
      reason: z.nativeEnum(TransactionReason).describe('Reason code for the transaction'),
      amount: z.number().positive().describe('Transaction amount in the base currency unit'),
      payees: z.array(z.object(PAY_SCHEMA)).optional().describe('Recipient wallets'),
      payers: z.array(z.object(PAY_SCHEMA)).optional().describe('Source wallets'),
      invoice: z.string().optional().describe('Optional linked invoice id'),
      saga_ttl: z.number().int().positive().default(3600).describe('Saga time-to-live in seconds (default: 3600)'),
    },
    outputSchema: {
      errors: z.array(z.object({}).passthrough()).optional(),
      result: z
        .object({
          saga: z.object({}).passthrough().optional(),
          transaction: z.object({}).passthrough().optional(),
        })
        .optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('init_financial_transaction', requestInfo, args);
      const config = { headers: { ...(args.headers ?? {}), ...headers } };

      // Step 1: create the orchestration saga
      const sagaPayload = {
        ttl: args.saga_ttl ?? 3600,
        job: 'financial-transaction',
        state: SagaState.AWAITING,
        session: crypto.randomUUID(),
      };
      logger('creating saga: %o', sagaPayload);
      const saga = await mcp.platform.essential.sagas.create(sagaPayload, config);
      logger('saga created: %s', saga.id);

      // Step 2: create the transaction linked to the saga
      const txPayload: Record<string, any> = {
        saga: saga.id,
        type: args.type,
        reason: args.reason,
        amount: args.amount,
      };
      if (args.payees) txPayload.payees = args.payees;
      if (args.payers) txPayload.payers = args.payers;
      if (args.invoice) txPayload.invoice = args.invoice;

      logger('creating transaction: %o', txPayload);
      const transaction = await mcp.platform.financial.transactions.create(txPayload, config);
      logger('transaction created: %s', transaction.id);

      return {
        structuredContent: { result: { saga, transaction } },
        content: [
          {
            type: 'text',
            text:
              `Transaction initiated.\n` +
              `  saga id:        ${saga.id}\n` +
              `  transaction id: ${transaction.id}\n` +
              `Monitor saga state to track completion. States: AWAITING → COMMITTED | ABORTED.`,
          },
        ],
      };
    }),
);
