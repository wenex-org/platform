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
import { CreateAccountDto, UpdateAccountDto } from '@app/common/dto/conjoint';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Account } from '@app/common/interfaces/conjoint';
import { AccountType } from '@app/common/enums/conjoint';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type AccountSchema = Record<keyof Account, ZodType>;

const ACCOUNT_SCHEMA: Partial<AccountSchema> = {
  type: z.nativeEnum(AccountType),

  profile: z.string().optional(),

  bio: z.string().optional(),
  status: z.string().optional(),
};

const ACCOUNT_INPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_INPUT_SCHEMA };
const ACCOUNT_OUTPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ConjointAccount

mcp.server.registerTool(
  'count_conjoint_accounts',
  {
    title: 'Count ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_conjoint_accounts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.conjoint.accounts.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ConjointAccount

mcp.server.registerTool(
  'create_conjoint_accounts',
  {
    title: 'Create ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: ACCOUNT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_conjoint_accounts', requestInfo, args);

      const payload = args.body as CreateAccountDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.accounts.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ConjointAccount

mcp.server.registerTool(
  'create-bulk_conjoint_accounts',
  {
    title: 'Create Bulk ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(ACCOUNT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ACCOUNT_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_conjoint_accounts', requestInfo, args);

      const payload = args.body as { items: CreateAccountDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.accounts.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ConjointAccount

mcp.server.registerTool(
  'find_conjoint_accounts',
  {
    title: 'Find ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ACCOUNT_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_conjoint_accounts', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.conjoint.accounts.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ConjointAccount

mcp.server.registerTool(
  'find-one_conjoint_accounts',
  {
    title: 'Find One ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_conjoint_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.accounts.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Account found successfully.` : `Account not found.` }],
      };
    }),
);

// Delete One ConjointAccount

mcp.server.registerTool(
  'delete-one_conjoint_accounts',
  {
    title: 'Delete One ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_conjoint_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.accounts.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ConjointAccount

mcp.server.registerTool(
  'restore-one_conjoint_accounts',
  {
    title: 'Restore One ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_conjoint_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.accounts.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account restored successfully.` }],
      };
    }),
);

// Destroy One ConjointAccount

mcp.server.registerTool(
  'destroy-one_conjoint_accounts',
  {
    title: 'Destroy One ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_conjoint_accounts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.accounts.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ConjointAccount

mcp.server.registerTool(
  'update-bulk_conjoint_accounts',
  {
    title: 'Update Bulk ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: ACCOUNT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_conjoint_accounts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateAccountDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.conjoint.accounts.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ConjointAccount

mcp.server.registerTool(
  'update-one_conjoint_accounts',
  {
    title: 'Update One ConjointAccount',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: ACCOUNT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ACCOUNT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_conjoint_accounts', requestInfo, args);

      const payload = args.body as UpdateAccountDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.accounts.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Account updated successfully.` }],
      };
    }),
);
