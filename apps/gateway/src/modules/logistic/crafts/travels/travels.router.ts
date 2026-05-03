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
import { CreateTravelDto, UpdateTravelDto } from '@app/common/dto/logistic';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Travel } from '@app/common/interfaces/logistic';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type TravelSchema = Record<keyof Travel, ZodType>;

const TRAVEL_SCHEMA: Partial<TravelSchema> = {
  cargoes: z.array(z.string()).optional(),
  drivers: z.array(z.string()).optional(),
  vehicles: z.array(z.string()).optional(),

  locations: z.array(z.string()),
};

const TRAVEL_INPUT_SCHEMA: Partial<TravelSchema> = { ...TRAVEL_SCHEMA, ...CORE_INPUT_SCHEMA };
const TRAVEL_OUTPUT_SCHEMA: Partial<TravelSchema> = { ...TRAVEL_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count LogisticTravel

mcp.server.registerTool(
  'count_logistic_travels',
  {
    title: 'Count LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_logistic_travels', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.logistic.travels.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create LogisticTravel

mcp.server.registerTool(
  'create_logistic_travels',
  {
    title: 'Create LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: TRAVEL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TRAVEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_logistic_travels', requestInfo, args);

      const payload = args.body as CreateTravelDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.travels.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Travel with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk LogisticTravel

mcp.server.registerTool(
  'create-bulk_logistic_travels',
  {
    title: 'Create Bulk LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(TRAVEL_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(TRAVEL_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_logistic_travels', requestInfo, args);

      const payload = args.body as { items: CreateTravelDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.travels.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find LogisticTravel

mcp.server.registerTool(
  'find_logistic_travels',
  {
    title: 'Find LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(TRAVEL_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_logistic_travels', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.logistic.travels.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One LogisticTravel

mcp.server.registerTool(
  'find-one_logistic_travels',
  {
    title: 'Find One LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRAVEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_logistic_travels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.travels.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Travel found successfully.` : `Travel not found.` }],
      };
    }),
);

// Delete One LogisticTravel

mcp.server.registerTool(
  'delete-one_logistic_travels',
  {
    title: 'Delete One LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRAVEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_logistic_travels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.travels.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Travel deleted (soft) successfully.` }],
      };
    }),
);

// Restore One LogisticTravel

mcp.server.registerTool(
  'restore-one_logistic_travels',
  {
    title: 'Restore One LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRAVEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_logistic_travels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.travels.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Travel restored successfully.` }],
      };
    }),
);

// Destroy One LogisticTravel

mcp.server.registerTool(
  'destroy-one_logistic_travels',
  {
    title: 'Destroy One LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TRAVEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_logistic_travels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.travels.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Travel destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk LogisticTravel

mcp.server.registerTool(
  'update-bulk_logistic_travels',
  {
    title: 'Update Bulk LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: TRAVEL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_logistic_travels', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateTravelDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.logistic.travels.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One LogisticTravel

mcp.server.registerTool(
  'update-one_logistic_travels',
  {
    title: 'Update One LogisticTravel',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: TRAVEL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TRAVEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_logistic_travels', requestInfo, args);

      const payload = args.body as UpdateTravelDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.travels.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Travel updated successfully.` }],
      };
    }),
);
