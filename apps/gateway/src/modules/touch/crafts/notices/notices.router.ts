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
import { CreateNoticeDto, UpdateNoticeDto } from '@app/common/dto/touch';
import { Notice, NoticeAction } from '@app/common/interfaces/touch';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { NoticeType } from '@app/common/enums/touch';
import { z, ZodType } from 'zod/v4';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const ACTION_SCHEMA: Record<keyof NoticeAction, ZodType> = {
  label: z.string(),
  type: z.string().optional(),
  path: z.string().optional(),
  icon: z.string().optional(),
};

type NoticeSchema = Record<keyof Notice, ZodType>;

const NOTICE_SCHEMA: Partial<NoticeSchema> = {
  type: z.enum(NoticeType),

  title: z.string(),
  subtitle: z.string().optional(),

  content: z.string(),
  category: z.string().optional(),

  visited: z.boolean().optional(),
  visited_at: z.string().optional(),
  visited_by: z.string().optional(),
  visited_in: z.string().optional(),

  thumbnail: z.string().optional(),
  attachments: z.array(z.any()).optional(),

  actions: z.array(z.object(ACTION_SCHEMA)).optional(),
};

const NOTICE_INPUT_SCHEMA: Partial<NoticeSchema> = { ...NOTICE_SCHEMA, ...CORE_INPUT_SCHEMA };
const NOTICE_OUTPUT_SCHEMA: Partial<NoticeSchema> = { ...NOTICE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count TouchNotice

mcp.server.registerTool(
  'count_touch_notices',
  {
    title: 'Count TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_touch_notices', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.touch.notices.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create TouchNotice

mcp.server.registerTool(
  'create_touch_notices',
  {
    title: 'Create TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: NOTICE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: NOTICE_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_touch_notices', http?.req, args);

      const payload = args.body as CreateNoticeDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.notices.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Notice with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk TouchNotice

mcp.server.registerTool(
  'create-bulk_touch_notices',
  {
    title: 'Create Bulk TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(NOTICE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(NOTICE_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_touch_notices', http?.req, args);

      const payload = args.body as { items: CreateNoticeDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.notices.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find TouchNotice

mcp.server.registerTool(
  'find_touch_notices',
  {
    title: 'Find TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(NOTICE_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_touch_notices', http?.req, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.touch.notices.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One TouchNotice

mcp.server.registerTool(
  'find-one_touch_notices',
  {
    title: 'Find One TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTICE_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_touch_notices', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.notices.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Notice found successfully.` : `Notice not found.` }],
      };
    }),
);

// Delete One TouchNotice

mcp.server.registerTool(
  'delete-one_touch_notices',
  {
    title: 'Delete One TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTICE_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_touch_notices', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.notices.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Notice deleted (soft) successfully.` }],
      };
    }),
);

// Restore One TouchNotice

mcp.server.registerTool(
  'restore-one_touch_notices',
  {
    title: 'Restore One TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTICE_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_touch_notices', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.notices.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Notice restored successfully.` }],
      };
    }),
);

// Destroy One TouchNotice

mcp.server.registerTool(
  'destroy-one_touch_notices',
  {
    title: 'Destroy One TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTICE_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_touch_notices', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.notices.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Notice destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk TouchNotice

mcp.server.registerTool(
  'update-bulk_touch_notices',
  {
    title: 'Update Bulk TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: NOTICE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_touch_notices', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdateNoticeDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.touch.notices.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One TouchNotice

mcp.server.registerTool(
  'update-one_touch_notices',
  {
    title: 'Update One TouchNotice',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: NOTICE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: NOTICE_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_touch_notices', http?.req, args);

      const payload = args.body as UpdateNoticeDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.notices.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Notice updated successfully.` }],
      };
    }),
);
