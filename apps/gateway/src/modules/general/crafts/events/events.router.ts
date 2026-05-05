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
import { CreateEventDto, UpdateEventDto } from '@app/common/dto/general';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Event } from '@app/common/interfaces/general';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type EventSchema = Record<keyof Event, ZodType>;

const EVENT_SCHEMA: Partial<EventSchema> = {
  title: z.string(),
  subtitle: z.string().optional(),

  s_date: z.string(),
  e_date: z.string(),

  place: z.string().optional(),
  location: z.string().optional(),

  attendees: z.array(z.string()).optional(),
  organizers: z.array(z.string()).optional(),

  status: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),

  correlation: z.string().optional(),
};

const EVENT_INPUT_SCHEMA: Partial<EventSchema> = { ...EVENT_SCHEMA, ...CORE_INPUT_SCHEMA };
const EVENT_OUTPUT_SCHEMA: Partial<EventSchema> = { ...EVENT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count GeneralEvent

mcp.server.registerTool(
  'count_general_events',
  {
    title: 'Count GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_general_events', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.general.events.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create GeneralEvent

mcp.server.registerTool(
  'create_general_events',
  {
    title: 'Create GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: EVENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: EVENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_general_events', requestInfo, args);

      const payload = args.body as CreateEventDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.events.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Event with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk GeneralEvent

mcp.server.registerTool(
  'create-bulk_general_events',
  {
    title: 'Create Bulk GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(EVENT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(EVENT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_general_events', requestInfo, args);

      const payload = args.body as { items: CreateEventDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.events.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find GeneralEvent

mcp.server.registerTool(
  'find_general_events',
  {
    title: 'Find GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(EVENT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_general_events', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.general.events.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One GeneralEvent

mcp.server.registerTool(
  'find-one_general_events',
  {
    title: 'Find One GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EVENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_general_events', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.events.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Event found successfully.` : `Event not found.` }],
      };
    }),
);

// Delete One GeneralEvent

mcp.server.registerTool(
  'delete-one_general_events',
  {
    title: 'Delete One GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EVENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_general_events', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.events.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Event deleted (soft) successfully.` }],
      };
    }),
);

// Restore One GeneralEvent

mcp.server.registerTool(
  'restore-one_general_events',
  {
    title: 'Restore One GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EVENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_general_events', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.events.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Event restored successfully.` }],
      };
    }),
);

// Destroy One GeneralEvent

mcp.server.registerTool(
  'destroy-one_general_events',
  {
    title: 'Destroy One GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EVENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_general_events', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.events.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Event destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk GeneralEvent

mcp.server.registerTool(
  'update-bulk_general_events',
  {
    title: 'Update Bulk GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: EVENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_general_events', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateEventDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.general.events.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One GeneralEvent

mcp.server.registerTool(
  'update-one_general_events',
  {
    title: 'Update One GeneralEvent',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: EVENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: EVENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_general_events', requestInfo, args);

      const payload = args.body as UpdateEventDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.events.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Event updated successfully.` }],
      };
    }),
);
