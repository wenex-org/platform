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
import { CreatePushDto, UpdatePushDto } from '@app/common/dto/touch';
import { Push, PushKeys } from '@app/common/interfaces/touch';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { z, ZodType } from 'zod/v4';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const KEYS_SCHEMA: Record<keyof PushKeys, ZodType> = {
  auth: z.string(),
  p256dh: z.string(),
};

type PushSchema = Record<keyof Push, ZodType>;

const PUSH_SCHEMA: Partial<PushSchema> = {
  session: z.string(),

  keys: z.object(KEYS_SCHEMA),
  endpoint: z.string(),

  blacklist: z.string().optional(),

  expiration: z.number(),
};

const PUSH_INPUT_SCHEMA: Partial<PushSchema> = { ...PUSH_SCHEMA, ...CORE_INPUT_SCHEMA };
const PUSH_OUTPUT_SCHEMA: Partial<PushSchema> = { ...PUSH_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count TouchPush

mcp.server.registerTool(
  'count_touch_pushes',
  {
    title: 'Count TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_touch_pushes', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.touch.pushes.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create TouchPush

mcp.server.registerTool(
  'create_touch_pushes',
  {
    title: 'Create TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: PUSH_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: PUSH_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_touch_pushes', http?.req, args);

      const payload = args.body as CreatePushDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.pushes.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Push with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk TouchPush

mcp.server.registerTool(
  'create-bulk_touch_pushes',
  {
    title: 'Create Bulk TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(PUSH_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(PUSH_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_touch_pushes', http?.req, args);

      const payload = args.body as { items: CreatePushDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.pushes.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find TouchPush

mcp.server.registerTool(
  'find_touch_pushes',
  {
    title: 'Find TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(PUSH_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_touch_pushes', http?.req, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.touch.pushes.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One TouchPush

mcp.server.registerTool(
  'find-one_touch_pushes',
  {
    title: 'Find One TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PUSH_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_touch_pushes', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.pushes.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Push found successfully.` : `Push not found.` }],
      };
    }),
);

// Delete One TouchPush

mcp.server.registerTool(
  'delete-one_touch_pushes',
  {
    title: 'Delete One TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PUSH_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_touch_pushes', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.pushes.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Push deleted (soft) successfully.` }],
      };
    }),
);

// Restore One TouchPush

mcp.server.registerTool(
  'restore-one_touch_pushes',
  {
    title: 'Restore One TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PUSH_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_touch_pushes', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.pushes.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Push restored successfully.` }],
      };
    }),
);

// Destroy One TouchPush

mcp.server.registerTool(
  'destroy-one_touch_pushes',
  {
    title: 'Destroy One TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PUSH_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_touch_pushes', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.pushes.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Push destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk TouchPush

mcp.server.registerTool(
  'update-bulk_touch_pushes',
  {
    title: 'Update Bulk TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: PUSH_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_touch_pushes', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdatePushDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.touch.pushes.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One TouchPush

mcp.server.registerTool(
  'update-one_touch_pushes',
  {
    title: 'Update One TouchPush',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: PUSH_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: PUSH_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_touch_pushes', http?.req, args);

      const payload = args.body as UpdatePushDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.pushes.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Push updated successfully.` }],
      };
    }),
);
