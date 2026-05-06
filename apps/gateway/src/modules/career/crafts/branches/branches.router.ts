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
import { CreateBranchDto, UpdateBranchDto } from '@app/common/dto/career';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { State, Status } from '@app/common/core/enums';
import { Branch } from '@app/common/interfaces/career';
import { BranchType } from '@app/common/enums/career';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type BranchSchema = Record<keyof Branch, ZodType>;

const BRANCH_SCHEMA: Partial<BranchSchema> = {
  type: z.nativeEnum(BranchType),

  name: z.string().optional(),
  business: z.string(),

  code: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status),

  rate: z.number(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  parent: z.string().optional(),
  manager: z.string().optional(),

  location: z.string(),

  phone: z.string().optional(),
  address: z.string().optional(),

  opening_date: z.string().optional(),
};

const BRANCH_INPUT_SCHEMA: Partial<BranchSchema> = { ...BRANCH_SCHEMA, ...CORE_INPUT_SCHEMA };
const BRANCH_OUTPUT_SCHEMA: Partial<BranchSchema> = { ...BRANCH_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count CareerBranch

mcp.server.registerTool(
  'count_career_branches',
  {
    title: 'Count CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_career_branches', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.career.branches.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create CareerBranch

mcp.server.registerTool(
  'create_career_branches',
  {
    title: 'Create CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: BRANCH_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: BRANCH_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_career_branches', requestInfo, args);

      const payload = args.body as CreateBranchDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.branches.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Branch with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk CareerBranch

mcp.server.registerTool(
  'create-bulk_career_branches',
  {
    title: 'Create Bulk CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(BRANCH_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(BRANCH_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_career_branches', requestInfo, args);

      const payload = args.body as { items: CreateBranchDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.branches.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find CareerBranch

mcp.server.registerTool(
  'find_career_branches',
  {
    title: 'Find CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(BRANCH_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_career_branches', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.career.branches.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from branches.` }],
      };
    }),
);

// Find One CareerBranch

mcp.server.registerTool(
  'find-one_career_branches',
  {
    title: 'Find One CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BRANCH_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_career_branches', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.branches.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Branch found successfully.` : `Branch not found.` }],
      };
    }),
);

// Delete One CareerBranch

mcp.server.registerTool(
  'delete-one_career_branches',
  {
    title: 'Delete One CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BRANCH_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_career_branches', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.branches.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Branch deleted (soft) successfully.` }],
      };
    }),
);

// Restore One CareerBranch

mcp.server.registerTool(
  'restore-one_career_branches',
  {
    title: 'Restore One CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BRANCH_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_career_branches', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.branches.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Branch restored successfully.` }],
      };
    }),
);

// Destroy One CareerBranch

mcp.server.registerTool(
  'destroy-one_career_branches',
  {
    title: 'Destroy One CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BRANCH_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_career_branches', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.branches.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Branch destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk CareerBranch

mcp.server.registerTool(
  'update-bulk_career_branches',
  {
    title: 'Update Bulk CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: BRANCH_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_career_branches', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateBranchDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.career.branches.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One CareerBranch

mcp.server.registerTool(
  'update-one_career_branches',
  {
    title: 'Update One CareerBranch',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: BRANCH_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: BRANCH_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_career_branches', requestInfo, args);

      const payload = args.body as UpdateBranchDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.branches.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Branch updated successfully.` }],
      };
    }),
);
