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
import { CreateMetricDto, UpdateMetricDto } from '@app/common/dto/thing';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { Metric } from '@app/common/interfaces/thing';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type MetricSchema = Record<keyof Metric, ZodType>;

const METRIC_SCHEMA: Partial<MetricSchema> = {
  sensor: z.string(),
  key: z.string().optional(),

  state: z.nativeEnum(State).optional(),

  device: z.string().optional(),
  value: z.union([z.number(), z.array(z.number())]),
};

const METRIC_INPUT_SCHEMA: Partial<MetricSchema> = { ...METRIC_SCHEMA, ...CORE_INPUT_SCHEMA };
const METRIC_OUTPUT_SCHEMA: Partial<MetricSchema> = { ...METRIC_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ThingMetric

mcp.server.registerTool(
  'count_thing_metrics',
  {
    title: 'Count ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_thing_metrics', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.thing.metrics.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ThingMetric

mcp.server.registerTool(
  'create_thing_metrics',
  {
    title: 'Create ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ body: METRIC_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: METRIC_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_thing_metrics', requestInfo, args);

      const payload = args.body as CreateMetricDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.thing.metrics.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Metric with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ThingMetric

mcp.server.registerTool(
  'create-bulk_thing_metrics',
  {
    title: 'Create Bulk ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(METRIC_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(METRIC_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_thing_metrics', requestInfo, args);

      const payload = args.body as { items: CreateMetricDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.thing.metrics.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ThingMetric

mcp.server.registerTool(
  'find_thing_metrics',
  {
    title: 'Find ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(METRIC_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_thing_metrics', requestInfo, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.thing.metrics.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ThingMetric

mcp.server.registerTool(
  'find-one_thing_metrics',
  {
    title: 'Find One ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: METRIC_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_thing_metrics', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.metrics.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Metric found successfully.` : `Metric not found.` }],
      };
    }),
);

// Delete One ThingMetric

mcp.server.registerTool(
  'delete-one_thing_metrics',
  {
    title: 'Delete One ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: METRIC_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_thing_metrics', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.metrics.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Metric deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ThingMetric

mcp.server.registerTool(
  'restore-one_thing_metrics',
  {
    title: 'Restore One ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: METRIC_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_thing_metrics', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.metrics.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Metric restored successfully.` }],
      };
    }),
);

// Destroy One ThingMetric

mcp.server.registerTool(
  'destroy-one_thing_metrics',
  {
    title: 'Destroy One ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: METRIC_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_thing_metrics', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.metrics.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Metric destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ThingMetric

mcp.server.registerTool(
  'update-bulk_thing_metrics',
  {
    title: 'Update Bulk ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: METRIC_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_thing_metrics', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdateMetricDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.thing.metrics.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ThingMetric

mcp.server.registerTool(
  'update-one_thing_metrics',
  {
    title: 'Update One ThingMetric',
    description: `Read "docs://service/thing-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: METRIC_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: METRIC_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_thing_metrics', requestInfo, args);

      const payload = args.body as UpdateMetricDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.thing.metrics.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Metric updated successfully.` }],
      };
    }),
);
