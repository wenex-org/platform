import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
  PAY_SCHEMA,
} from '@app/common/core/mcp';
import { TransactionType, TransactionState, TransactionReason } from '@app/common/enums/financial';
import { CreateTransactionDto, UpdateTransactionDto } from '@app/common/dto/financial';
import { Transaction } from '@app/common/interfaces/financial';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

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

// Count FinancialTransaction

mcp.server.registerTool(
  'count_financial_transactions',
  {
    title: 'Count FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_financial_transactions', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.financial.transactions.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create FinancialTransaction

mcp.server.registerTool(
  'create_financial_transactions',
  {
    title: 'Create FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: TRANSACTION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TRANSACTION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_financial_transactions', requestInfo, args);

      const payload = args.body as CreateTransactionDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.transactions.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Transaction with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk FinancialTransaction

mcp.server.registerTool(
  'create-bulk_financial_transactions',
  {
    title: 'Create Bulk FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(TRANSACTION_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(TRANSACTION_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_financial_transactions', requestInfo, args);

      const payload = args.body as { items: CreateTransactionDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.transactions.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find FinancialTransaction

mcp.server.registerTool(
  'find_financial_transactions',
  {
    title: 'Find FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(TRANSACTION_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_financial_transactions', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.financial.transactions.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One FinancialTransaction

mcp.server.registerTool(
  'find-one_financial_transactions',
  {
    title: 'Find One FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRANSACTION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_financial_transactions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.transactions.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Transaction found successfully.` : `Transaction not found.` }],
      };
    }),
);

// Delete One FinancialTransaction

mcp.server.registerTool(
  'delete-one_financial_transactions',
  {
    title: 'Delete One FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRANSACTION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_financial_transactions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.transactions.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Transaction deleted (soft) successfully.` }],
      };
    }),
);

// Restore One FinancialTransaction

mcp.server.registerTool(
  'restore-one_financial_transactions',
  {
    title: 'Restore One FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRANSACTION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_financial_transactions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.transactions.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Transaction restored successfully.` }],
      };
    }),
);

// Destroy One FinancialTransaction

mcp.server.registerTool(
  'destroy-one_financial_transactions',
  {
    title: 'Destroy One FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRANSACTION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_financial_transactions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.transactions.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Transaction destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk FinancialTransaction

mcp.server.registerTool(
  'update-bulk_financial_transactions',
  {
    title: 'Update Bulk FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: TRANSACTION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_financial_transactions', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateTransactionDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.financial.transactions.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One FinancialTransaction

mcp.server.registerTool(
  'update-one_financial_transactions',
  {
    title: 'Update One FinancialTransaction',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: TRANSACTION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TRANSACTION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_financial_transactions', requestInfo, args);

      const payload = args.body as UpdateTransactionDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.transactions.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Transaction updated successfully.` }],
      };
    }),
);
