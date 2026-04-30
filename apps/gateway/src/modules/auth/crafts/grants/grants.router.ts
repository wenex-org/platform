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
import { CreateGrantDto, UpdateGrantDto } from '@app/common/dto/auth';
import { Grant, GrantTime } from '@app/common/interfaces/auth';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const TIME_SCHEMA: Record<keyof GrantTime, ZodType> = {
  cron_exp: z.string(),
  duration: z.number().positive(),
};

type GrantSchema = Record<keyof Grant, ZodType>;

const GRANT_SCHEMA: Partial<GrantSchema> = {
  subject: z.string(),
  action: z.string(),
  object: z.string(),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z.array(z.object(TIME_SCHEMA)).optional(),
};

const GRANT_INPUT_SCHEMA: Partial<GrantSchema> = { ...GRANT_SCHEMA, ...CORE_INPUT_SCHEMA };
const GRANT_OUTPUT_SCHEMA: Partial<GrantSchema> = { ...GRANT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count AuthGrant

mcp.server.registerTool(
  'count_auth_grants',
  {
    title: 'Count AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_auth_grants', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.auth.grants.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create AuthGrant

mcp.server.registerTool(
  'create_auth_grants',
  {
    title: 'Create AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ body: GRANT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: GRANT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_auth_grants', requestInfo, args);

      const payload = args.body as CreateGrantDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.auth.grants.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Grant for subject "${result.subject}" created successfully.` }],
      };
    }),
);

// Create Bulk AuthGrant

mcp.server.registerTool(
  'create-bulk_auth_grants',
  {
    title: 'Create Bulk AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(GRANT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(GRANT_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_auth_grants', requestInfo, args);

      const payload = args.body as { items: CreateGrantDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.auth.grants.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} grants in bulk.` }],
      };
    }),
);

// Find AuthGrant

mcp.server.registerTool(
  'find_auth_grants',
  {
    title: 'Find AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(GRANT_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_auth_grants', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.auth.grants.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Found ${result.length ?? 0} items.` }],
      };
    }),
);

// Find One AuthGrant

mcp.server.registerTool(
  'find-one_auth_grants',
  {
    title: 'Find One AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: GRANT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_auth_grants', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.auth.grants.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Grant found successfully.` : `Grant not found.` }],
      };
    }),
);

// Delete One AuthGrant

mcp.server.registerTool(
  'delete-one_auth_grants',
  {
    title: 'Delete One AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: GRANT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_auth_grants', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.auth.grants.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Grant deleted (soft) successfully.` }],
      };
    }),
);

// Restore One AuthGrant

mcp.server.registerTool(
  'restore-one_auth_grants',
  {
    title: 'Restore One AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: GRANT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_auth_grants', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.auth.grants.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Grant restored successfully.` }],
      };
    }),
);

// Destroy One AuthGrant

mcp.server.registerTool(
  'destroy-one_auth_grants',
  {
    title: 'Destroy One AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: GRANT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_auth_grants', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.auth.grants.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Grant destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk AuthGrant

mcp.server.registerTool(
  'update-bulk_auth_grants',
  {
    title: 'Update Bulk AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: GRANT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_auth_grants', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateGrantDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.auth.grants.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One AuthGrant

mcp.server.registerTool(
  'update-one_auth_grants',
  {
    title: 'Update One AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: GRANT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: GRANT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_auth_grants', requestInfo, args);

      const payload = args.body as UpdateGrantDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.auth.grants.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Grant updated successfully.` }],
      };
    }),
);
