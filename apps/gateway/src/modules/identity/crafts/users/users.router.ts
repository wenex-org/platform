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
import { CreateUserDto, UpdateUserDto } from '@app/common/dto/identity';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { User } from '@app/common/interfaces/identity';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type UserSchema = Record<keyof User, ZodType>;

const USER_SCHEMA: Partial<UserSchema> = {
  status: z.nativeEnum(Status),

  tz: z.string(),
  lang: z.string(),
  region: z.string(),

  email: z.string().optional(),
  phone: z.string().optional(),

  username: z.string().optional(),

  subjects: z.array(z.string()).optional(),
};

const USER_INPUT_SCHEMA: Partial<UserSchema> = { ...USER_SCHEMA, ...CORE_INPUT_SCHEMA };
const USER_OUTPUT_SCHEMA: Partial<UserSchema> = { ...USER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count IdentityUser

mcp.server.registerTool(
  'count_identity_users',
  {
    title: 'Count IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_identity_users', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.identity.users.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create IdentityUser

mcp.server.registerTool(
  'create_identity_users',
  {
    title: 'Create IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ body: USER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: USER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_identity_users', requestInfo, args);

      const payload = args.body as CreateUserDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.identity.users.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `User with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk IdentityUser

mcp.server.registerTool(
  'create-bulk_identity_users',
  {
    title: 'Create Bulk IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(USER_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(USER_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_identity_users', requestInfo, args);

      const payload = args.body as { items: CreateUserDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.identity.users.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find IdentityUser

mcp.server.registerTool(
  'find_identity_users',
  {
    title: 'Find IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(USER_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_identity_users', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.identity.users.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One IdentityUser

mcp.server.registerTool(
  'find-one_identity_users',
  {
    title: 'Find One IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: USER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_identity_users', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.users.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `User found successfully.` : `User not found.` }],
      };
    }),
);

// Delete One IdentityUser

mcp.server.registerTool(
  'delete-one_identity_users',
  {
    title: 'Delete One IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: USER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_identity_users', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.users.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `User deleted (soft) successfully.` }],
      };
    }),
);

// Restore One IdentityUser

mcp.server.registerTool(
  'restore-one_identity_users',
  {
    title: 'Restore One IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: USER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_identity_users', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.users.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `User restored successfully.` }],
      };
    }),
);

// Destroy One IdentityUser

mcp.server.registerTool(
  'destroy-one_identity_users',
  {
    title: 'Destroy One IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: USER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_identity_users', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.users.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `User destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk IdentityUser

mcp.server.registerTool(
  'update-bulk_identity_users',
  {
    title: 'Update Bulk IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: USER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_identity_users', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateUserDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.identity.users.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One IdentityUser

mcp.server.registerTool(
  'update-one_identity_users',
  {
    title: 'Update One IdentityUser',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: USER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: USER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_identity_users', requestInfo, args);

      const payload = args.body as UpdateUserDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.users.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `User updated successfully.` }],
      };
    }),
);
