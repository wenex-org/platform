import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, PAY_SCHEMA } from '@app/common/core/mcp';
import { TransactionType, TransactionState, TransactionReason } from '@app/common/enums/financial';
import { Transaction } from '@app/common/interfaces/financial';
import { z, ZodType } from 'zod';

type TransactionSchema = Record<keyof Transaction, ZodType>;
const TRANSACTION_SCHEMA: Partial<TransactionSchema> = {
  saga: z.string(),

  type: z.nativeEnum(TransactionType),
  state: z.nativeEnum(TransactionState),
  reason: z.nativeEnum(TransactionReason),

  amount: z.number(),

  payees: z.array(z.object(PAY_SCHEMA)).optional(),
  payers: z.array(z.object(PAY_SCHEMA)).optional(),

  failed_at: z.string().optional(),
  verified_at: z.string().optional(),
  canceled_at: z.string().optional(),

  invoice: z.string().optional(),
};

const TRANSACTION_INPUT_SCHEMA: Partial<TransactionSchema> = { ...TRANSACTION_SCHEMA, ...CORE_INPUT_SCHEMA };
const TRANSACTION_OUTPUT_SCHEMA: Partial<TransactionSchema> = { ...TRANSACTION_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'financial',
  collection: 'transactions',
  entityName: 'FinancialTransaction',
  inputSchema: TRANSACTION_INPUT_SCHEMA,
  outputSchema: TRANSACTION_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/financial-specification',
  getRestfulService: (platform) => platform.financial.transactions,
});
