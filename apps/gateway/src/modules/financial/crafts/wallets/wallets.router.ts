import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
} from '@app/common/core/mcp';
import { CreateWalletDto, UpdateWalletDto } from '@app/common/dto/financial';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Wallet } from '@app/common/interfaces/financial';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type WalletSchema = Record<keyof Wallet, ZodType>;

const WALLET_SCHEMA: Partial<WalletSchema> = {
  strict: z.boolean().optional(),

  account: z.string(),
  currency: z.string(),

  amount: z.number(),
  blocked: z.number().optional(),
  internal: z.number().optional(),
  external: z.number().optional(),

  address: z.string().optional(),
  private: z.string().optional(),
};

const WALLET_INPUT_SCHEMA: Partial<WalletSchema> = { ...WALLET_SCHEMA, ...CORE_INPUT_SCHEMA };
const WALLET_OUTPUT_SCHEMA: Partial<WalletSchema> = { ...WALLET_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count FinancialWallet

mcp.server.registerTool(
  'count_financial_wallets',
  {
    title: 'Count FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_financial_wallets', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.financial.wallets.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create FinancialWallet

mcp.server.registerTool(
  'create_financial_wallets',
  {
    title: 'Create FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: WALLET_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: WALLET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_financial_wallets', requestInfo, args);

      const payload = args.body as CreateWalletDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.wallets.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Wallet with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk FinancialWallet

mcp.server.registerTool(
  'create-bulk_financial_wallets',
  {
    title: 'Create Bulk FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(WALLET_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(WALLET_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_financial_wallets', requestInfo, args);

      const payload = args.body as { items: CreateWalletDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.wallets.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find FinancialWallet

mcp.server.registerTool(
  'find_financial_wallets',
  {
    title: 'Find FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(WALLET_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_financial_wallets', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.financial.wallets.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One FinancialWallet

mcp.server.registerTool(
  'find-one_financial_wallets',
  {
    title: 'Find One FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WALLET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_financial_wallets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.wallets.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Wallet found successfully.` : `Wallet not found.` }],
      };
    }),
);

// Delete One FinancialWallet

mcp.server.registerTool(
  'delete-one_financial_wallets',
  {
    title: 'Delete One FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WALLET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_financial_wallets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.wallets.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Wallet deleted (soft) successfully.` }],
      };
    }),
);

// Restore One FinancialWallet

mcp.server.registerTool(
  'restore-one_financial_wallets',
  {
    title: 'Restore One FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WALLET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_financial_wallets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.wallets.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Wallet restored successfully.` }],
      };
    }),
);

// Destroy One FinancialWallet

mcp.server.registerTool(
  'destroy-one_financial_wallets',
  {
    title: 'Destroy One FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WALLET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_financial_wallets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.wallets.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Wallet destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk FinancialWallet

mcp.server.registerTool(
  'update-bulk_financial_wallets',
  {
    title: 'Update Bulk FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: WALLET_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_financial_wallets', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateWalletDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.financial.wallets.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One FinancialWallet

mcp.server.registerTool(
  'update-one_financial_wallets',
  {
    title: 'Update One FinancialWallet',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: WALLET_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: WALLET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_financial_wallets', requestInfo, args);

      const payload = args.body as UpdateWalletDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.wallets.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Wallet updated successfully.` }],
      };
    }),
);
