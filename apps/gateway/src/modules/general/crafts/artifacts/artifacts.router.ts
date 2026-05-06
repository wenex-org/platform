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
import { CreateArtifactDto, UpdateArtifactDto } from '@app/common/dto/general';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Artifact } from '@app/common/interfaces/general';
import { ValueType } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ArtifactSchema = Record<keyof Artifact, ZodType>;

const ARTIFACT_SCHEMA: Partial<ArtifactSchema> = {
  key: z.string(),
  type: z.nativeEnum(ValueType),
  value: z.any().optional(),
};

const ARTIFACT_INPUT_SCHEMA: Partial<ArtifactSchema> = { ...ARTIFACT_SCHEMA, ...CORE_INPUT_SCHEMA };
const ARTIFACT_OUTPUT_SCHEMA: Partial<ArtifactSchema> = { ...ARTIFACT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count GeneralArtifact

mcp.server.registerTool(
  'count_general_artifacts',
  {
    title: 'Count GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_general_artifacts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.general.artifacts.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create GeneralArtifact

mcp.server.registerTool(
  'create_general_artifacts',
  {
    title: 'Create GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: ARTIFACT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ARTIFACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_general_artifacts', requestInfo, args);

      const payload = args.body as CreateArtifactDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.artifacts.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Artifact with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk GeneralArtifact

mcp.server.registerTool(
  'create-bulk_general_artifacts',
  {
    title: 'Create Bulk GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(ARTIFACT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ARTIFACT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_general_artifacts', requestInfo, args);

      const payload = args.body as { items: CreateArtifactDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.artifacts.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find GeneralArtifact

mcp.server.registerTool(
  'find_general_artifacts',
  {
    title: 'Find GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(ARTIFACT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_general_artifacts', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.general.artifacts.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One GeneralArtifact

mcp.server.registerTool(
  'find-one_general_artifacts',
  {
    title: 'Find One GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ARTIFACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_general_artifacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.artifacts.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Artifact found successfully.` : `Artifact not found.` }],
      };
    }),
);

// Delete One GeneralArtifact

mcp.server.registerTool(
  'delete-one_general_artifacts',
  {
    title: 'Delete One GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ARTIFACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_general_artifacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.artifacts.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Artifact deleted (soft) successfully.` }],
      };
    }),
);

// Restore One GeneralArtifact

mcp.server.registerTool(
  'restore-one_general_artifacts',
  {
    title: 'Restore One GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ARTIFACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_general_artifacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.artifacts.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Artifact restored successfully.` }],
      };
    }),
);

// Destroy One GeneralArtifact

mcp.server.registerTool(
  'destroy-one_general_artifacts',
  {
    title: 'Destroy One GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: ARTIFACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_general_artifacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.artifacts.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Artifact destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk GeneralArtifact

mcp.server.registerTool(
  'update-bulk_general_artifacts',
  {
    title: 'Update Bulk GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: ARTIFACT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_general_artifacts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateArtifactDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.general.artifacts.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One GeneralArtifact

mcp.server.registerTool(
  'update-one_general_artifacts',
  {
    title: 'Update One GeneralArtifact',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: ARTIFACT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: ARTIFACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_general_artifacts', requestInfo, args);

      const payload = args.body as UpdateArtifactDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.artifacts.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Artifact updated successfully.` }],
      };
    }),
);
