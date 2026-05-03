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
import { CreateLocationDto, UpdateLocationDto } from '@app/common/dto/logistic';
import { LocationGeometryType, LocationType } from '@app/common/enums/logistic';
import { Location, LocationGeometry } from '@app/common/interfaces/logistic';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const GEOMETRY_SCHEMA: Record<keyof LocationGeometry, ZodType> = {
  type: z.nativeEnum(LocationGeometryType),
  coordinates: z.array(z.any()),
  bbox: z.array(z.number()).optional(),
};

type LocationSchema = Record<keyof Location, ZodType>;

const LOCATION_SCHEMA: Partial<LocationSchema> = {
  name: z.string().optional(),
  title: z.string().optional(),

  type: z.nativeEnum(LocationType).optional(),
  geometry: z.object(GEOMETRY_SCHEMA),
  properties: z.any().optional(),
};

const LOCATION_INPUT_SCHEMA: Partial<LocationSchema> = { ...LOCATION_SCHEMA, ...CORE_INPUT_SCHEMA };
const LOCATION_OUTPUT_SCHEMA: Partial<LocationSchema> = { ...LOCATION_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count LogisticLocation

mcp.server.registerTool(
  'count_logistic_locations',
  {
    title: 'Count LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_logistic_locations', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.logistic.locations.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create LogisticLocation

mcp.server.registerTool(
  'create_logistic_locations',
  {
    title: 'Create LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: LOCATION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: LOCATION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_logistic_locations', requestInfo, args);

      const payload = args.body as CreateLocationDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.locations.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Location with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk LogisticLocation

mcp.server.registerTool(
  'create-bulk_logistic_locations',
  {
    title: 'Create Bulk LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(LOCATION_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(LOCATION_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_logistic_locations', requestInfo, args);

      const payload = args.body as { items: CreateLocationDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.locations.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find LogisticLocation

mcp.server.registerTool(
  'find_logistic_locations',
  {
    title: 'Find LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(LOCATION_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_logistic_locations', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.logistic.locations.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One LogisticLocation

mcp.server.registerTool(
  'find-one_logistic_locations',
  {
    title: 'Find One LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: LOCATION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_logistic_locations', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.locations.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Location found successfully.` : `Location not found.` }],
      };
    }),
);

// Delete One LogisticLocation

mcp.server.registerTool(
  'delete-one_logistic_locations',
  {
    title: 'Delete One LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: LOCATION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_logistic_locations', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.locations.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Location deleted (soft) successfully.` }],
      };
    }),
);

// Restore One LogisticLocation

mcp.server.registerTool(
  'restore-one_logistic_locations',
  {
    title: 'Restore One LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: LOCATION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_logistic_locations', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.locations.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Location restored successfully.` }],
      };
    }),
);

// Destroy One LogisticLocation

mcp.server.registerTool(
  'destroy-one_logistic_locations',
  {
    title: 'Destroy One LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: LOCATION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_logistic_locations', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.locations.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Location destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk LogisticLocation

mcp.server.registerTool(
  'update-bulk_logistic_locations',
  {
    title: 'Update Bulk LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: LOCATION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_logistic_locations', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateLocationDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.logistic.locations.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One LogisticLocation

mcp.server.registerTool(
  'update-one_logistic_locations',
  {
    title: 'Update One LogisticLocation',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: LOCATION_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: LOCATION_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_logistic_locations', requestInfo, args);

      const payload = args.body as UpdateLocationDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.locations.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Location updated successfully.` }],
      };
    }),
);
