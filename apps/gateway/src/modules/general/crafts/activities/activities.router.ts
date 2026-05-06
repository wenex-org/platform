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
import { CreateActivityDto, UpdateActivityDto } from '@app/common/dto/general';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Activity } from '@app/common/interfaces/general';
import { ActivityType } from '@app/common/enums/general';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ActivitySchema = Record<keyof Activity, ZodType>;

const ACTIVITY_SCHEMA: Partial<ActivitySchema> = {
  type: z.nativeEnum(ActivityType),
  state: z.nativeEnum(State).optional(),
  source: z.string().optional(),

  message: z.string(),
  details: z.any().optional(),
  metadata: z.any().optional(),
};

const ACTIVITY_INPUT_SCHEMA: Partial<ActivitySchema> = { ...ACTIVITY_SCHEMA, ...CORE_INPUT_SCHEMA };
const ACTIVITY_OUTPUT_SCHEMA: Partial<ActivitySchema> = { ...ACTIVITY_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count GeneralActivity

mcp.server.registerTool(
  'count_general_activities',
  {
    title: 'Count GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_general_activities', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.general.activities.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create GeneralActivity

mcp.server.registerTool(
  'create_general_activities',
  {
    title: 'Create GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: ACTIVITY_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ACTIVITY_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_general_activities', requestInfo, args);

      const payload = args.body as CreateActivityDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.activities.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Activity with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk GeneralActivity

mcp.server.registerTool(
  'create-bulk_general_activities',
  {
    title: 'Create Bulk GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(ACTIVITY_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ACTIVITY_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_general_activities', requestInfo, args);

      const payload = args.body as { items: CreateActivityDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.activities.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find GeneralActivity

mcp.server.registerTool(
  'find_general_activities',
  {
    title: 'Find GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ACTIVITY_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_general_activities', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.general.activities.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One GeneralActivity

mcp.server.registerTool(
  'find-one_general_activities',
  {
    title: 'Find One GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACTIVITY_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_general_activities', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.activities.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Activity found successfully.` : `Activity not found.` }],
      };
    }),
);

// Delete One GeneralActivity

mcp.server.registerTool(
  'delete-one_general_activities',
  {
    title: 'Delete One GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACTIVITY_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_general_activities', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.activities.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Activity deleted (soft) successfully.` }],
      };
    }),
);

// Restore One GeneralActivity

mcp.server.registerTool(
  'restore-one_general_activities',
  {
    title: 'Restore One GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACTIVITY_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_general_activities', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.activities.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Activity restored successfully.` }],
      };
    }),
);

// Destroy One GeneralActivity

mcp.server.registerTool(
  'destroy-one_general_activities',
  {
    title: 'Destroy One GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ACTIVITY_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_general_activities', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.activities.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Activity destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk GeneralActivity

mcp.server.registerTool(
  'update-bulk_general_activities',
  {
    title: 'Update Bulk GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: ACTIVITY_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_general_activities', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateActivityDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.general.activities.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One GeneralActivity

mcp.server.registerTool(
  'update-one_general_activities',
  {
    title: 'Update One GeneralActivity',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: ACTIVITY_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ACTIVITY_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_general_activities', requestInfo, args);

      const payload = args.body as UpdateActivityDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.activities.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Activity updated successfully.` }],
      };
    }),
);
