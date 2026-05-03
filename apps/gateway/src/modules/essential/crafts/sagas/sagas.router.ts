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
import { CreateSagaDto, UpdateSagaDto } from '@app/common/dto/essential';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Saga } from '@app/common/interfaces/essential';
import { SagaState } from '@app/common/enums/essential';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type SagaSchema = Record<keyof Saga, ZodType>;

const SAGA_SCHEMA: Partial<SagaSchema> = {
  ttl: z.number(),
  job: z.string(),

  state: z.nativeEnum(SagaState),
  session: z.string(),

  pruned_at: z.string().optional(),
  aborted_at: z.string().optional(),
  committed_at: z.string().optional(),
};

const SAGA_INPUT_SCHEMA: Partial<SagaSchema> = { ...SAGA_SCHEMA, ...CORE_INPUT_SCHEMA };
const SAGA_OUTPUT_SCHEMA: Partial<SagaSchema> = { ...SAGA_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count EssentialSaga

mcp.server.registerTool(
  'count_essential_sagas',
  {
    title: 'Count EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_essential_sagas', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.essential.sagas.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create EssentialSaga

mcp.server.registerTool(
  'create_essential_sagas',
  {
    title: 'Create EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ body: SAGA_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SAGA_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_essential_sagas', requestInfo, args);

      const payload = args.body as CreateSagaDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.essential.sagas.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Saga with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk EssentialSaga

mcp.server.registerTool(
  'create-bulk_essential_sagas',
  {
    title: 'Create Bulk EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(SAGA_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SAGA_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_essential_sagas', requestInfo, args);

      const payload = args.body as { items: CreateSagaDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.essential.sagas.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find EssentialSaga

mcp.server.registerTool(
  'find_essential_sagas',
  {
    title: 'Find EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SAGA_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_essential_sagas', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.essential.sagas.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One EssentialSaga

mcp.server.registerTool(
  'find-one_essential_sagas',
  {
    title: 'Find One EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SAGA_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_essential_sagas', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.essential.sagas.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Saga found successfully.` : `Saga not found.` }],
      };
    }),
);

// Delete One EssentialSaga

mcp.server.registerTool(
  'delete-one_essential_sagas',
  {
    title: 'Delete One EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SAGA_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_essential_sagas', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.essential.sagas.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Saga deleted (soft) successfully.` }],
      };
    }),
);

// Restore One EssentialSaga

mcp.server.registerTool(
  'restore-one_essential_sagas',
  {
    title: 'Restore One EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SAGA_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_essential_sagas', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.essential.sagas.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Saga restored successfully.` }],
      };
    }),
);

// Destroy One EssentialSaga

mcp.server.registerTool(
  'destroy-one_essential_sagas',
  {
    title: 'Destroy One EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SAGA_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_essential_sagas', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.essential.sagas.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Saga destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk EssentialSaga

mcp.server.registerTool(
  'update-bulk_essential_sagas',
  {
    title: 'Update Bulk EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: SAGA_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_essential_sagas', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateSagaDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.essential.sagas.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One EssentialSaga

mcp.server.registerTool(
  'update-one_essential_sagas',
  {
    title: 'Update One EssentialSaga',
    description: `Read "docs://service/essential-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: SAGA_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SAGA_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_essential_sagas', requestInfo, args);

      const payload = args.body as UpdateSagaDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.essential.sagas.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Saga updated successfully.` }],
      };
    }),
);
