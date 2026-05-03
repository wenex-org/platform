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
import { CreateDriverDto, UpdateDriverDto } from '@app/common/dto/logistic';
import { Gender, State, Status } from '@app/common/core/enums';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Driver } from '@app/common/interfaces/logistic';
import { DriverType } from '@app/common/enums/logistic';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type DriverSchema = Record<keyof Driver, ZodType>;

const DRIVER_SCHEMA: Partial<DriverSchema> = {
  type: z.nativeEnum(DriverType),
  gender: z.nativeEnum(Gender),

  state: z.nativeEnum(State),
  status: z.nativeEnum(Status),

  license: z.string(),

  verified_at: z.string().optional(),
  verified_by: z.string().optional(),
  verified_in: z.string().optional(),

  expiration_date: z.string(),
};

const DRIVER_INPUT_SCHEMA: Partial<DriverSchema> = { ...DRIVER_SCHEMA, ...CORE_INPUT_SCHEMA };
const DRIVER_OUTPUT_SCHEMA: Partial<DriverSchema> = { ...DRIVER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count LogisticDriver

mcp.server.registerTool(
  'count_logistic_drivers',
  {
    title: 'Count LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_logistic_drivers', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.logistic.drivers.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create LogisticDriver

mcp.server.registerTool(
  'create_logistic_drivers',
  {
    title: 'Create LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: DRIVER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: DRIVER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_logistic_drivers', requestInfo, args);

      const payload = args.body as CreateDriverDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.drivers.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Driver with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk LogisticDriver

mcp.server.registerTool(
  'create-bulk_logistic_drivers',
  {
    title: 'Create Bulk LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(DRIVER_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(DRIVER_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_logistic_drivers', requestInfo, args);

      const payload = args.body as { items: CreateDriverDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.drivers.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find LogisticDriver

mcp.server.registerTool(
  'find_logistic_drivers',
  {
    title: 'Find LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(DRIVER_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_logistic_drivers', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.logistic.drivers.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One LogisticDriver

mcp.server.registerTool(
  'find-one_logistic_drivers',
  {
    title: 'Find One LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: DRIVER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_logistic_drivers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.drivers.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Driver found successfully.` : `Driver not found.` }],
      };
    }),
);

// Delete One LogisticDriver

mcp.server.registerTool(
  'delete-one_logistic_drivers',
  {
    title: 'Delete One LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: DRIVER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_logistic_drivers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.drivers.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Driver deleted (soft) successfully.` }],
      };
    }),
);

// Restore One LogisticDriver

mcp.server.registerTool(
  'restore-one_logistic_drivers',
  {
    title: 'Restore One LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: DRIVER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_logistic_drivers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.drivers.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Driver restored successfully.` }],
      };
    }),
);

// Destroy One LogisticDriver

mcp.server.registerTool(
  'destroy-one_logistic_drivers',
  {
    title: 'Destroy One LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: DRIVER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_logistic_drivers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.drivers.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Driver destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk LogisticDriver

mcp.server.registerTool(
  'update-bulk_logistic_drivers',
  {
    title: 'Update Bulk LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: DRIVER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_logistic_drivers', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateDriverDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.logistic.drivers.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One LogisticDriver

mcp.server.registerTool(
  'update-one_logistic_drivers',
  {
    title: 'Update One LogisticDriver',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: DRIVER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: DRIVER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_logistic_drivers', requestInfo, args);

      const payload = args.body as UpdateDriverDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.drivers.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Driver updated successfully.` }],
      };
    }),
);
