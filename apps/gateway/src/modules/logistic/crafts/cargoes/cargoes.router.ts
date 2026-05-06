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
import { CreateCargoDto, UpdateCargoDto } from '@app/common/dto/logistic';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Cargo } from '@app/common/interfaces/logistic';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type CargoSchema = Record<keyof Cargo, ZodType>;

const CARGO_SCHEMA: Partial<CargoSchema> = {
  title: z.string().optional(),

  weight: z.number(),

  width: z.number(),
  height: z.number(),
  length: z.number(),

  fragile: z.boolean().optional(),
  perishable: z.boolean().optional(),

  travels: z.array(z.string()).optional(),
};

const CARGO_INPUT_SCHEMA: Partial<CargoSchema> = { ...CARGO_SCHEMA, ...CORE_INPUT_SCHEMA };
const CARGO_OUTPUT_SCHEMA: Partial<CargoSchema> = { ...CARGO_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count LogisticCargo

mcp.server.registerTool(
  'count_logistic_cargoes',
  {
    title: 'Count LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_logistic_cargoes', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.logistic.cargoes.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create LogisticCargo

mcp.server.registerTool(
  'create_logistic_cargoes',
  {
    title: 'Create LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: CARGO_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CARGO_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_logistic_cargoes', requestInfo, args);

      const payload = args.body as CreateCargoDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.cargoes.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Cargo with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk LogisticCargo

mcp.server.registerTool(
  'create-bulk_logistic_cargoes',
  {
    title: 'Create Bulk LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(CARGO_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CARGO_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_logistic_cargoes', requestInfo, args);

      const payload = args.body as { items: CreateCargoDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.logistic.cargoes.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find LogisticCargo

mcp.server.registerTool(
  'find_logistic_cargoes',
  {
    title: 'Find LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CARGO_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_logistic_cargoes', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.logistic.cargoes.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One LogisticCargo

mcp.server.registerTool(
  'find-one_logistic_cargoes',
  {
    title: 'Find One LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CARGO_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_logistic_cargoes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.cargoes.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Cargo found successfully.` : `Cargo not found.` }],
      };
    }),
);

// Delete One LogisticCargo

mcp.server.registerTool(
  'delete-one_logistic_cargoes',
  {
    title: 'Delete One LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CARGO_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_logistic_cargoes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.cargoes.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Cargo deleted (soft) successfully.` }],
      };
    }),
);

// Restore One LogisticCargo

mcp.server.registerTool(
  'restore-one_logistic_cargoes',
  {
    title: 'Restore One LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CARGO_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_logistic_cargoes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.cargoes.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Cargo restored successfully.` }],
      };
    }),
);

// Destroy One LogisticCargo

mcp.server.registerTool(
  'destroy-one_logistic_cargoes',
  {
    title: 'Destroy One LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CARGO_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_logistic_cargoes', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.cargoes.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Cargo destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk LogisticCargo

mcp.server.registerTool(
  'update-bulk_logistic_cargoes',
  {
    title: 'Update Bulk LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: CARGO_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_logistic_cargoes', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateCargoDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.logistic.cargoes.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One LogisticCargo

mcp.server.registerTool(
  'update-one_logistic_cargoes',
  {
    title: 'Update One LogisticCargo',
    description: `Read "docs://service/logistic-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: CARGO_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CARGO_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_logistic_cargoes', requestInfo, args);

      const payload = args.body as UpdateCargoDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.logistic.cargoes.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Cargo updated successfully.` }],
      };
    }),
);
