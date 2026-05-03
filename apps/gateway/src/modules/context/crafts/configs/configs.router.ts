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
import { CreateConfigDto, UpdateConfigDto } from '@app/common/dto/context';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Config } from '@app/common/interfaces/context';
import { ConfigKey } from '@app/common/enums/context';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ConfigSchema = Record<keyof Config, ZodType>;

const CONFIG_SCHEMA: Partial<ConfigSchema> = {
  key: z.nativeEnum(ConfigKey),
  eid: z.string(),
  value: z.any().optional(),
  status: z.nativeEnum(Status).optional(),
};

const CONFIG_INPUT_SCHEMA: Partial<ConfigSchema> = { ...CONFIG_SCHEMA, ...CORE_INPUT_SCHEMA };
const CONFIG_OUTPUT_SCHEMA: Partial<ConfigSchema> = { ...CONFIG_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ContextConfig

mcp.server.registerTool(
  'count_context_configs',
  {
    title: 'Count ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_context_configs', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.context.configs.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ContextConfig

mcp.server.registerTool(
  'create_context_configs',
  {
    title: 'Create ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ body: CONFIG_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CONFIG_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_context_configs', requestInfo, args);

      const payload = args.body as CreateConfigDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.context.configs.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Config with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ContextConfig

mcp.server.registerTool(
  'create-bulk_context_configs',
  {
    title: 'Create Bulk ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(CONFIG_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CONFIG_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_context_configs', requestInfo, args);

      const payload = args.body as { items: CreateConfigDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.context.configs.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ContextConfig

mcp.server.registerTool(
  'find_context_configs',
  {
    title: 'Find ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CONFIG_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_context_configs', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.context.configs.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ContextConfig

mcp.server.registerTool(
  'find-one_context_configs',
  {
    title: 'Find One ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONFIG_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_context_configs', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.configs.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Config found successfully.` : `Config not found.` }],
      };
    }),
);

// Delete One ContextConfig

mcp.server.registerTool(
  'delete-one_context_configs',
  {
    title: 'Delete One ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONFIG_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_context_configs', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.configs.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Config deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ContextConfig

mcp.server.registerTool(
  'restore-one_context_configs',
  {
    title: 'Restore One ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONFIG_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_context_configs', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.configs.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Config restored successfully.` }],
      };
    }),
);

// Destroy One ContextConfig

mcp.server.registerTool(
  'destroy-one_context_configs',
  {
    title: 'Destroy One ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONFIG_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_context_configs', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.configs.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Config destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ContextConfig

mcp.server.registerTool(
  'update-bulk_context_configs',
  {
    title: 'Update Bulk ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: CONFIG_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_context_configs', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateConfigDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.context.configs.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ContextConfig

mcp.server.registerTool(
  'update-one_context_configs',
  {
    title: 'Update One ContextConfig',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: CONFIG_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CONFIG_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_context_configs', requestInfo, args);

      const payload = args.body as UpdateConfigDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.configs.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Config updated successfully.` }],
      };
    }),
);
