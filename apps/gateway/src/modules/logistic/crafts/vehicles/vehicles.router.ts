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
import { CreateVehicleDto, UpdateVehicleDto } from '@app/common/dto/logistic';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Vehicle } from '@app/common/interfaces/logistic';
import { VehicleType } from '@app/common/enums/logistic';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type VehicleSchema = Record<keyof Vehicle, ZodType>;

const VEHICLE_SCHEMA: Partial<VehicleSchema> = {
  type: z.nativeEnum(VehicleType),

  status: z.nativeEnum(Status),

  plates: z.array(z.string()),
  drivers: z.array(z.string()).optional(),
};

const VEHICLE_INPUT_SCHEMA: Partial<VehicleSchema> = { ...VEHICLE_SCHEMA, ...CORE_INPUT_SCHEMA };
const VEHICLE_OUTPUT_SCHEMA: Partial<VehicleSchema> = { ...VEHICLE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count LogisticVehicle

mcp.server.registerTool(
  'count_logistic_vehicles',
  {
    title: 'Count LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_logistic_vehicles', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.logistic.vehicles.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create LogisticVehicle

mcp.server.registerTool(
  'create_logistic_vehicles',
  {
    title: 'Create LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: VEHICLE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: VEHICLE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_logistic_vehicles', requestInfo, args);

      const payload = args.body as CreateVehicleDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.vehicles.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Vehicle with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk LogisticVehicle

mcp.server.registerTool(
  'create-bulk_logistic_vehicles',
  {
    title: 'Create Bulk LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(VEHICLE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(VEHICLE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_logistic_vehicles', requestInfo, args);

      const payload = args.body as { items: CreateVehicleDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.vehicles.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find LogisticVehicle

mcp.server.registerTool(
  'find_logistic_vehicles',
  {
    title: 'Find LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(VEHICLE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_logistic_vehicles', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.logistic.vehicles.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One LogisticVehicle

mcp.server.registerTool(
  'find-one_logistic_vehicles',
  {
    title: 'Find One LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: VEHICLE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_logistic_vehicles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.vehicles.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Vehicle found successfully.` : `Vehicle not found.` }],
      };
    }),
);

// Delete One LogisticVehicle

mcp.server.registerTool(
  'delete-one_logistic_vehicles',
  {
    title: 'Delete One LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: VEHICLE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_logistic_vehicles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.vehicles.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Vehicle deleted (soft) successfully.` }],
      };
    }),
);

// Restore One LogisticVehicle

mcp.server.registerTool(
  'restore-one_logistic_vehicles',
  {
    title: 'Restore One LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: VEHICLE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_logistic_vehicles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.vehicles.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Vehicle restored successfully.` }],
      };
    }),
);

// Destroy One LogisticVehicle

mcp.server.registerTool(
  'destroy-one_logistic_vehicles',
  {
    title: 'Destroy One LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: VEHICLE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_logistic_vehicles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.vehicles.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Vehicle destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk LogisticVehicle

mcp.server.registerTool(
  'update-bulk_logistic_vehicles',
  {
    title: 'Update Bulk LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: VEHICLE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_logistic_vehicles', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateVehicleDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.logistic.vehicles.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One LogisticVehicle

mcp.server.registerTool(
  'update-one_logistic_vehicles',
  {
    title: 'Update One LogisticVehicle',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: VEHICLE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: VEHICLE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_logistic_vehicles', requestInfo, args);

      const payload = args.body as UpdateVehicleDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.vehicles.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Vehicle updated successfully.` }],
      };
    }),
);
