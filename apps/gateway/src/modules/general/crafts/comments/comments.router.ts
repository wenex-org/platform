import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
  REACTION_SCHEMA,
} from '@app/common/core/mcp';
import { CreateCommentDto, UpdateCommentDto } from '@app/common/dto/general';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Comment } from '@app/common/interfaces/general';
import { CommentStatus } from '@app/common/enums/general';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type CommentSchema = Record<keyof Comment, ZodType>;

const COMMENT_SCHEMA: Partial<CommentSchema> = {
  type: z.string().optional(),

  post: z.string().optional(),
  ticket: z.string().optional(),

  content: z.string(),

  level: z.number().optional(),

  parent: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(CommentStatus).optional(),
  visibility: z.string().optional(),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  views: z.number().optional(),
  loves: z.number().optional(),
  likes: z.number().optional(),
  dislikes: z.number().optional(),

  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),

  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

const COMMENT_INPUT_SCHEMA: Partial<CommentSchema> = { ...COMMENT_SCHEMA, ...CORE_INPUT_SCHEMA };
const COMMENT_OUTPUT_SCHEMA: Partial<CommentSchema> = { ...COMMENT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count GeneralComment

mcp.server.registerTool(
  'count_general_comments',
  {
    title: 'Count GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_general_comments', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.general.comments.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create GeneralComment

mcp.server.registerTool(
  'create_general_comments',
  {
    title: 'Create GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: COMMENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: COMMENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_general_comments', requestInfo, args);

      const payload = args.body as CreateCommentDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.comments.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Comment with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk GeneralComment

mcp.server.registerTool(
  'create-bulk_general_comments',
  {
    title: 'Create Bulk GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(COMMENT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(COMMENT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_general_comments', requestInfo, args);

      const payload = args.body as { items: CreateCommentDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.comments.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find GeneralComment

mcp.server.registerTool(
  'find_general_comments',
  {
    title: 'Find GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(COMMENT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_general_comments', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.general.comments.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One GeneralComment

mcp.server.registerTool(
  'find-one_general_comments',
  {
    title: 'Find One GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: COMMENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_general_comments', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.comments.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Comment found successfully.` : `Comment not found.` }],
      };
    }),
);

// Delete One GeneralComment

mcp.server.registerTool(
  'delete-one_general_comments',
  {
    title: 'Delete One GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: COMMENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_general_comments', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.comments.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Comment deleted (soft) successfully.` }],
      };
    }),
);

// Restore One GeneralComment

mcp.server.registerTool(
  'restore-one_general_comments',
  {
    title: 'Restore One GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: COMMENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_general_comments', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.comments.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Comment restored successfully.` }],
      };
    }),
);

// Destroy One GeneralComment

mcp.server.registerTool(
  'destroy-one_general_comments',
  {
    title: 'Destroy One GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: COMMENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_general_comments', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.comments.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Comment destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk GeneralComment

mcp.server.registerTool(
  'update-bulk_general_comments',
  {
    title: 'Update Bulk GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: COMMENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_general_comments', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateCommentDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.general.comments.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One GeneralComment

mcp.server.registerTool(
  'update-one_general_comments',
  {
    title: 'Update One GeneralComment',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: COMMENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: COMMENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_general_comments', requestInfo, args);

      const payload = args.body as UpdateCommentDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.comments.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Comment updated successfully.` }],
      };
    }),
);
