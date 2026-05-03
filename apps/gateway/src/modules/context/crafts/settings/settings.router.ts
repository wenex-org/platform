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
import { CreateSettingDto, UpdateSettingDto } from '@app/common/dto/context';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Status, ValueType } from '@app/common/core/enums';
import { Setting } from '@app/common/interfaces/context';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type SettingSchema = Record<keyof Setting, ZodType>;

const SETTING_SCHEMA: Partial<SettingSchema> = {
  key: z.string(),
  type: z.nativeEnum(ValueType),
  value: z.any().optional(),
  status: z.nativeEnum(Status).optional(),
};

const SETTING_INPUT_SCHEMA: Partial<SettingSchema> = { ...SETTING_SCHEMA, ...CORE_INPUT_SCHEMA };
const SETTING_OUTPUT_SCHEMA: Partial<SettingSchema> = { ...SETTING_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ContextSetting

mcp.server.registerTool(
  'count_context_settings',
  {
    title: 'Count ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_context_settings', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.context.settings.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ContextSetting

mcp.server.registerTool(
  'create_context_settings',
  {
    title: 'Create ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ body: SETTING_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SETTING_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_context_settings', requestInfo, args);

      const payload = args.body as CreateSettingDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.context.settings.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Setting with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ContextSetting

mcp.server.registerTool(
  'create-bulk_context_settings',
  {
    title: 'Create Bulk ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(SETTING_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SETTING_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_context_settings', requestInfo, args);

      const payload = args.body as { items: CreateSettingDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.context.settings.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ContextSetting

mcp.server.registerTool(
  'find_context_settings',
  {
    title: 'Find ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SETTING_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_context_settings', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.context.settings.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ContextSetting

mcp.server.registerTool(
  'find-one_context_settings',
  {
    title: 'Find One ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SETTING_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_context_settings', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.settings.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Setting found successfully.` : `Setting not found.` }],
      };
    }),
);

// Delete One ContextSetting

mcp.server.registerTool(
  'delete-one_context_settings',
  {
    title: 'Delete One ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SETTING_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_context_settings', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.settings.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Setting deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ContextSetting

mcp.server.registerTool(
  'restore-one_context_settings',
  {
    title: 'Restore One ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SETTING_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_context_settings', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.settings.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Setting restored successfully.` }],
      };
    }),
);

// Destroy One ContextSetting

mcp.server.registerTool(
  'destroy-one_context_settings',
  {
    title: 'Destroy One ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SETTING_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_context_settings', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.settings.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Setting destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ContextSetting

mcp.server.registerTool(
  'update-bulk_context_settings',
  {
    title: 'Update Bulk ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: SETTING_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_context_settings', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateSettingDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.context.settings.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ContextSetting

mcp.server.registerTool(
  'update-one_context_settings',
  {
    title: 'Update One ContextSetting',
    description: `Read "docs://service/context-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: SETTING_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SETTING_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_context_settings', requestInfo, args);

      const payload = args.body as UpdateSettingDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.context.settings.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Setting updated successfully.` }],
      };
    }),
);
