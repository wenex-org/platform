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
import { Workflow, WorkflowState, WorkflowToken } from '@app/common/interfaces/general';
import { CreateWorkflowDto, UpdateWorkflowDto } from '@app/common/dto/general';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { WorkflowStatus } from '@app/common/enums/general';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const STATE_SCHEMA: Record<keyof WorkflowState, ZodType> = {
  ref: z.string(),
  name: z.string().optional(),
  status: z.nativeEnum(WorkflowStatus),
  value: z.any().optional(),
};

const TOKEN_SCHEMA: Record<keyof WorkflowToken, ZodType> = {
  id: z.string(),
  parent: z.string().optional(),
  locked: z.boolean().optional(),
  history: z.array(z.object(STATE_SCHEMA)),
};

type WorkflowSchema = Record<keyof Workflow, ZodType>;

const WORKFLOW_SCHEMA: Partial<WorkflowSchema> = {
  name: z.string(),

  status: z.nativeEnum(WorkflowStatus),
  tokens: z.array(z.object(TOKEN_SCHEMA)),

  data: z.any().optional(),
};

const WORKFLOW_INPUT_SCHEMA: Partial<WorkflowSchema> = { ...WORKFLOW_SCHEMA, ...CORE_INPUT_SCHEMA };
const WORKFLOW_OUTPUT_SCHEMA: Partial<WorkflowSchema> = { ...WORKFLOW_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count GeneralWorkflow

mcp.server.registerTool(
  'count_general_workflows',
  {
    title: 'Count GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_general_workflows', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.general.workflows.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create GeneralWorkflow

mcp.server.registerTool(
  'create_general_workflows',
  {
    title: 'Create GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: WORKFLOW_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: WORKFLOW_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_general_workflows', requestInfo, args);

      const payload = args.body as CreateWorkflowDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.workflows.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Workflow with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk GeneralWorkflow

mcp.server.registerTool(
  'create-bulk_general_workflows',
  {
    title: 'Create Bulk GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(WORKFLOW_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(WORKFLOW_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_general_workflows', requestInfo, args);

      const payload = args.body as { items: CreateWorkflowDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.general.workflows.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find GeneralWorkflow

mcp.server.registerTool(
  'find_general_workflows',
  {
    title: 'Find GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(WORKFLOW_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_general_workflows', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.general.workflows.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One GeneralWorkflow

mcp.server.registerTool(
  'find-one_general_workflows',
  {
    title: 'Find One GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WORKFLOW_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_general_workflows', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.workflows.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Workflow found successfully.` : `Workflow not found.` }],
      };
    }),
);

// Delete One GeneralWorkflow

mcp.server.registerTool(
  'delete-one_general_workflows',
  {
    title: 'Delete One GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WORKFLOW_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_general_workflows', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.workflows.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Workflow deleted (soft) successfully.` }],
      };
    }),
);

// Restore One GeneralWorkflow

mcp.server.registerTool(
  'restore-one_general_workflows',
  {
    title: 'Restore One GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WORKFLOW_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_general_workflows', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.workflows.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Workflow restored successfully.` }],
      };
    }),
);

// Destroy One GeneralWorkflow

mcp.server.registerTool(
  'destroy-one_general_workflows',
  {
    title: 'Destroy One GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: WORKFLOW_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_general_workflows', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.workflows.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Workflow destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk GeneralWorkflow

mcp.server.registerTool(
  'update-bulk_general_workflows',
  {
    title: 'Update Bulk GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: WORKFLOW_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_general_workflows', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateWorkflowDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.general.workflows.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One GeneralWorkflow

mcp.server.registerTool(
  'update-one_general_workflows',
  {
    title: 'Update One GeneralWorkflow',
    description: `Read "docs://service/general-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: WORKFLOW_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: WORKFLOW_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_general_workflows', requestInfo, args);

      const payload = args.body as UpdateWorkflowDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.general.workflows.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Workflow updated successfully.` }],
      };
    }),
);
