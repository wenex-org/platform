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
import { CreateSensorDto, UpdateSensorDto } from '@app/common/dto/thing';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { State, Status } from '@app/common/core/enums';
import { Sensor } from '@app/common/interfaces/thing';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type SensorSchema = Record<keyof Sensor, ZodType>;

const SENSOR_SCHEMA: Partial<SensorSchema> = {
  device: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),

  unit: z.string().optional(),
  metric: z.string().optional(),
};

const SENSOR_INPUT_SCHEMA: Partial<SensorSchema> = { ...SENSOR_SCHEMA, ...CORE_INPUT_SCHEMA };
const SENSOR_OUTPUT_SCHEMA: Partial<SensorSchema> = { ...SENSOR_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ThingSensor

mcp.server.registerTool(
  'count_thing_sensors',
  {
    title: 'Count ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_thing_sensors', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.thing.sensors.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ThingSensor

mcp.server.registerTool(
  'create_thing_sensors',
  {
    title: 'Create ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ body: SENSOR_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SENSOR_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_thing_sensors', requestInfo, args);

      const payload = args.body as CreateSensorDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.thing.sensors.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sensor with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ThingSensor

mcp.server.registerTool(
  'create-bulk_thing_sensors',
  {
    title: 'Create Bulk ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(SENSOR_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SENSOR_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_thing_sensors', requestInfo, args);

      const payload = args.body as { items: CreateSensorDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.thing.sensors.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ThingSensor

mcp.server.registerTool(
  'find_thing_sensors',
  {
    title: 'Find ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SENSOR_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_thing_sensors', requestInfo, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.thing.sensors.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ThingSensor

mcp.server.registerTool(
  'find-one_thing_sensors',
  {
    title: 'Find One ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SENSOR_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_thing_sensors', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.sensors.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Sensor found successfully.` : `Sensor not found.` }],
      };
    }),
);

// Delete One ThingSensor

mcp.server.registerTool(
  'delete-one_thing_sensors',
  {
    title: 'Delete One ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SENSOR_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_thing_sensors', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.sensors.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sensor deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ThingSensor

mcp.server.registerTool(
  'restore-one_thing_sensors',
  {
    title: 'Restore One ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SENSOR_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_thing_sensors', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.sensors.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sensor restored successfully.` }],
      };
    }),
);

// Destroy One ThingSensor

mcp.server.registerTool(
  'destroy-one_thing_sensors',
  {
    title: 'Destroy One ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SENSOR_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_thing_sensors', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.sensors.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sensor destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ThingSensor

mcp.server.registerTool(
  'update-bulk_thing_sensors',
  {
    title: 'Update Bulk ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: SENSOR_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_thing_sensors', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdateSensorDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.thing.sensors.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ThingSensor

mcp.server.registerTool(
  'update-one_thing_sensors',
  {
    title: 'Update One ThingSensor',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: SENSOR_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SENSOR_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_thing_sensors', requestInfo, args);

      const payload = args.body as UpdateSensorDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.sensors.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sensor updated successfully.` }],
      };
    }),
);
