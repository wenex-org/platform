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
import { CreateFileDto, UpdateFileDto } from '@app/common/dto/special';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { File } from '@app/common/interfaces/special';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type FileSchema = Record<keyof File, ZodType>;

const FILE_SCHEMA: Partial<FileSchema> = {
  field: z.string().optional(),
  title: z.string().optional(),

  state: z.nativeEnum(State).optional(),

  original: z.string(),
  encoding: z.string().optional(),
  mimetype: z.string(),

  size: z.number(),
  bucket: z.string(),

  key: z.string(),
  acl: z.string(),

  content_type: z.string().optional(),
  storage_class: z.string().optional(),

  location: z.string(),
  etag: z.string().optional(),
};

const FILE_INPUT_SCHEMA: Partial<FileSchema> = { ...FILE_SCHEMA, ...CORE_INPUT_SCHEMA };
const FILE_OUTPUT_SCHEMA: Partial<FileSchema> = { ...FILE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count SpecialFile

mcp.server.registerTool(
  'count_special_files',
  {
    title: 'Count SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_special_files', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.special.files.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create SpecialFile

mcp.server.registerTool(
  'create_special_files',
  {
    title: 'Create SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ body: FILE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: FILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_special_files', requestInfo, args);

      const payload = args.body as CreateFileDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.special.files.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `File with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk SpecialFile

mcp.server.registerTool(
  'create-bulk_special_files',
  {
    title: 'Create Bulk SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(FILE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(FILE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_special_files', requestInfo, args);

      const payload = args.body as { items: CreateFileDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.special.files.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find SpecialFile

mcp.server.registerTool(
  'find_special_files',
  {
    title: 'Find SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(FILE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_special_files', requestInfo, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.special.files.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One SpecialFile

mcp.server.registerTool(
  'find-one_special_files',
  {
    title: 'Find One SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: FILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_special_files', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.files.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `File found successfully.` : `File not found.` }],
      };
    }),
);

// Delete One SpecialFile

mcp.server.registerTool(
  'delete-one_special_files',
  {
    title: 'Delete One SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: FILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_special_files', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.files.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `File deleted (soft) successfully.` }],
      };
    }),
);

// Restore One SpecialFile

mcp.server.registerTool(
  'restore-one_special_files',
  {
    title: 'Restore One SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: FILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_special_files', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.files.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `File restored successfully.` }],
      };
    }),
);

// Destroy One SpecialFile

mcp.server.registerTool(
  'destroy-one_special_files',
  {
    title: 'Destroy One SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: FILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_special_files', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.files.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `File destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk SpecialFile

mcp.server.registerTool(
  'update-bulk_special_files',
  {
    title: 'Update Bulk SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: FILE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_special_files', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdateFileDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.special.files.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One SpecialFile

mcp.server.registerTool(
  'update-one_special_files',
  {
    title: 'Update One SpecialFile',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: FILE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: FILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_special_files', requestInfo, args);

      const payload = args.body as UpdateFileDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.files.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `File updated successfully.` }],
      };
    }),
);
