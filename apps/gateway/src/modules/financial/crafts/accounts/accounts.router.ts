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
import { CreateAccountDto, UpdateAccountDto } from '@app/common/dto/financial';
import { AccountType, AccountOwnership } from '@app/common/enums/financial';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Account } from '@app/common/interfaces/financial';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type AccountSchema = Record<keyof Account, ZodType>;

const ACCOUNT_SCHEMA: Partial<AccountSchema> = {
  type: z.nativeEnum(AccountType),
  ownership: z.nativeEnum(AccountOwnership),
  members: z.array(z.string()).optional(),
};

const ACCOUNT_INPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_INPUT_SCHEMA };
const ACCOUNT_OUTPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count FinancialAccount

mcp.server.registerTool(
  'count_financial_accounts',
  {
    title: 'Count FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_financial_accounts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.financial.accounts.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create FinancialAccount

mcp.server.registerTool(
  'create_financial_accounts',
  {
    title: 'Create FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: ACCOUNT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_financial_accounts', requestInfo, args);

      const payload = args.body as CreateAccountDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.accounts.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk FinancialAccount

mcp.server.registerTool(
  'create-bulk_financial_accounts',
  {
    title: 'Create Bulk FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(ACCOUNT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ACCOUNT_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_financial_accounts', requestInfo, args);

      const payload = args.body as { items: CreateAccountDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.accounts.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find FinancialAccount

mcp.server.registerTool(
  'find_financial_accounts',
  {
    title: 'Find FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ACCOUNT_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_financial_accounts', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.financial.accounts.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One FinancialAccount

mcp.server.registerTool(
  'find-one_financial_accounts',
  {
    title: 'Find One FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_financial_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.accounts.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Account found successfully.` : `Account not found.` }],
      };
    }),
);

// Delete One FinancialAccount

mcp.server.registerTool(
  'delete-one_financial_accounts',
  {
    title: 'Delete One FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_financial_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.accounts.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account deleted (soft) successfully.` }],
      };
    }),
);

// Restore One FinancialAccount

mcp.server.registerTool(
  'restore-one_financial_accounts',
  {
    title: 'Restore One FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_financial_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.accounts.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account restored successfully.` }],
      };
    }),
);

// Destroy One FinancialAccount

mcp.server.registerTool(
  'destroy-one_financial_accounts',
  {
    title: 'Destroy One FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_financial_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.accounts.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk FinancialAccount

mcp.server.registerTool(
  'update-bulk_financial_accounts',
  {
    title: 'Update Bulk FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: ACCOUNT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_financial_accounts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateAccountDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.financial.accounts.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One FinancialAccount

mcp.server.registerTool(
  'update-one_financial_accounts',
  {
    title: 'Update One FinancialAccount',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: ACCOUNT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_financial_accounts', requestInfo, args);

      const payload = args.body as UpdateAccountDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.accounts.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account updated successfully.` }],
      };
    }),
);
