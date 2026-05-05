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
import { CreatePostDto, UpdatePostDto } from '@app/common/dto/content';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { PostStatus } from '@app/common/enums/content';
import { Post } from '@app/common/interfaces/content';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type PostSchema = Record<keyof Post, ZodType>;

const POST_SCHEMA: Partial<PostSchema> = {
  title: z.string(),
  type: z.string().optional(),

  slug: z.string().optional(),
  subtitle: z.string().optional(),

  parent: z.string().optional(),

  content: z.string(),
  summary: z.string().optional(),

  categories: z.array(z.string()).optional(),

  state: z.nativeEnum(State),
  status: z.nativeEnum(PostStatus),
  visibility: z.string().optional(),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  views: z.number().optional(),
  loves: z.number().optional(),
  likes: z.number().optional(),
  dislikes: z.number().optional(),

  thumbnail: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  featured_image: z.string().optional(),

  keywords: z.array(z.string()).optional(),

  related_posts: z.array(z.string()).optional(),
  publication_date: z.string().optional(),

  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

const POST_INPUT_SCHEMA: Partial<PostSchema> = { ...POST_SCHEMA, ...CORE_INPUT_SCHEMA };
const POST_OUTPUT_SCHEMA: Partial<PostSchema> = { ...POST_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ContentPost

mcp.server.registerTool(
  'count_content_posts',
  {
    title: 'Count ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_content_posts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.content.posts.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ContentPost

mcp.server.registerTool(
  'create_content_posts',
  {
    title: 'Create ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ body: POST_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: POST_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_content_posts', requestInfo, args);

      const payload = args.body as CreatePostDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.content.posts.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Post with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ContentPost

mcp.server.registerTool(
  'create-bulk_content_posts',
  {
    title: 'Create Bulk ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(POST_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(POST_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_content_posts', requestInfo, args);

      const payload = args.body as { items: CreatePostDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.content.posts.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ContentPost

mcp.server.registerTool(
  'find_content_posts',
  {
    title: 'Find ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(POST_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_content_posts', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.content.posts.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ContentPost

mcp.server.registerTool(
  'find-one_content_posts',
  {
    title: 'Find One ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: POST_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_content_posts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.posts.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Post found successfully.` : `Post not found.` }],
      };
    }),
);

// Delete One ContentPost

mcp.server.registerTool(
  'delete-one_content_posts',
  {
    title: 'Delete One ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: POST_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_content_posts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.posts.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Post deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ContentPost

mcp.server.registerTool(
  'restore-one_content_posts',
  {
    title: 'Restore One ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: POST_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_content_posts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.posts.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Post restored successfully.` }],
      };
    }),
);

// Destroy One ContentPost

mcp.server.registerTool(
  'destroy-one_content_posts',
  {
    title: 'Destroy One ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: POST_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_content_posts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.posts.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Post destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ContentPost

mcp.server.registerTool(
  'update-bulk_content_posts',
  {
    title: 'Update Bulk ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: POST_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_content_posts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdatePostDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.content.posts.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ContentPost

mcp.server.registerTool(
  'update-one_content_posts',
  {
    title: 'Update One ContentPost',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: POST_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: POST_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_content_posts', requestInfo, args);

      const payload = args.body as UpdatePostDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.posts.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Post updated successfully.` }],
      };
    }),
);
