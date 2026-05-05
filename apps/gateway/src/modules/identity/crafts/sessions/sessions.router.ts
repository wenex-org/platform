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
import { CreateSessionDto, UpdateSessionDto } from '@app/common/dto/identity';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Session } from '@app/common/interfaces/identity';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type SessionSchema = Record<keyof Session, ZodType>;

const SESSION_SCHEMA: Partial<SessionSchema> = {
  ip: z.string(),
  agent: z.string(),
  expiration: z.number(),
};

const SESSION_INPUT_SCHEMA: Partial<SessionSchema> = { ...SESSION_SCHEMA, ...CORE_INPUT_SCHEMA };
const SESSION_OUTPUT_SCHEMA: Partial<SessionSchema> = { ...SESSION_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count IdentitySession

mcp.server.registerTool(
  'count_identity_sessions',
  {
    title: 'Count IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_identity_sessions', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.identity.sessions.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create IdentitySession

mcp.server.registerTool(
  'create_identity_sessions',
  {
    title: 'Create IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ body: SESSION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SESSION_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_identity_sessions', requestInfo, args);

      const payload = args.body as CreateSessionDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.identity.sessions.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Session with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk IdentitySession

mcp.server.registerTool(
  'create-bulk_identity_sessions',
  {
    title: 'Create Bulk IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(SESSION_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SESSION_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_identity_sessions', requestInfo, args);

      const payload = args.body as { items: CreateSessionDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.identity.sessions.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find IdentitySession

mcp.server.registerTool(
  'find_identity_sessions',
  {
    title: 'Find IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SESSION_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_identity_sessions', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.identity.sessions.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One IdentitySession

mcp.server.registerTool(
  'find-one_identity_sessions',
  {
    title: 'Find One IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SESSION_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_identity_sessions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.sessions.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Session found successfully.` : `Session not found.` }],
      };
    }),
);

// Delete One IdentitySession

mcp.server.registerTool(
  'delete-one_identity_sessions',
  {
    title: 'Delete One IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SESSION_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_identity_sessions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.sessions.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Session deleted (soft) successfully.` }],
      };
    }),
);

// Restore One IdentitySession

mcp.server.registerTool(
  'restore-one_identity_sessions',
  {
    title: 'Restore One IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SESSION_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_identity_sessions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.sessions.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Session restored successfully.` }],
      };
    }),
);

// Destroy One IdentitySession

mcp.server.registerTool(
  'destroy-one_identity_sessions',
  {
    title: 'Destroy One IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SESSION_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_identity_sessions', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.sessions.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Session destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk IdentitySession

mcp.server.registerTool(
  'update-bulk_identity_sessions',
  {
    title: 'Update Bulk IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: SESSION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_identity_sessions', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateSessionDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.identity.sessions.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One IdentitySession

mcp.server.registerTool(
  'update-one_identity_sessions',
  {
    title: 'Update One IdentitySession',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: SESSION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SESSION_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_identity_sessions', requestInfo, args);

      const payload = args.body as UpdateSessionDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.sessions.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Session updated successfully.` }],
      };
    }),
);
