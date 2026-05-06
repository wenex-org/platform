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
import { CreateNoteDto, UpdateNoteDto } from '@app/common/dto/content';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Note } from '@app/common/interfaces/content';
import { NoteType } from '@app/common/enums/content';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type NoteSchema = Record<keyof Note, ZodType>;

const NOTE_SCHEMA: Partial<NoteSchema> = {
  type: z.nativeEnum(NoteType),

  state: z.nativeEnum(State).optional(),
  status: z.string().optional(),

  content: z.string(),

  level: z.number().optional(),

  parent: z.string().optional(),
  relation: z.string().optional(),
  visibility: z.string().optional(),

  loves: z.number().optional(),
  likes: z.number().optional(),
  dislikes: z.number().optional(),

  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),

  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

const NOTE_INPUT_SCHEMA: Partial<NoteSchema> = { ...NOTE_SCHEMA, ...CORE_INPUT_SCHEMA };
const NOTE_OUTPUT_SCHEMA: Partial<NoteSchema> = { ...NOTE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ContentNote

mcp.server.registerTool(
  'count_content_notes',
  {
    title: 'Count ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_content_notes', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.content.notes.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ContentNote

mcp.server.registerTool(
  'create_content_notes',
  {
    title: 'Create ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ body: NOTE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: NOTE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_content_notes', requestInfo, args);

      const payload = args.body as CreateNoteDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.content.notes.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Note with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ContentNote

mcp.server.registerTool(
  'create-bulk_content_notes',
  {
    title: 'Create Bulk ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(NOTE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(NOTE_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_content_notes', requestInfo, args);

      const payload = args.body as { items: CreateNoteDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.content.notes.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ContentNote

mcp.server.registerTool(
  'find_content_notes',
  {
    title: 'Find ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(NOTE_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_content_notes', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.content.notes.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ContentNote

mcp.server.registerTool(
  'find-one_content_notes',
  {
    title: 'Find One ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_content_notes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.notes.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Note found successfully.` : `Note not found.` }],
      };
    }),
);

// Delete One ContentNote

mcp.server.registerTool(
  'delete-one_content_notes',
  {
    title: 'Delete One ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_content_notes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.notes.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Note deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ContentNote

mcp.server.registerTool(
  'restore-one_content_notes',
  {
    title: 'Restore One ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_content_notes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.notes.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Note restored successfully.` }],
      };
    }),
);

// Destroy One ContentNote

mcp.server.registerTool(
  'destroy-one_content_notes',
  {
    title: 'Destroy One ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: NOTE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_content_notes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.notes.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Note destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ContentNote

mcp.server.registerTool(
  'update-bulk_content_notes',
  {
    title: 'Update Bulk ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: NOTE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_content_notes', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateNoteDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.content.notes.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ContentNote

mcp.server.registerTool(
  'update-one_content_notes',
  {
    title: 'Update One ContentNote',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: NOTE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: NOTE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_content_notes', requestInfo, args);

      const payload = args.body as UpdateNoteDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.notes.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Note updated successfully.` }],
      };
    }),
);
