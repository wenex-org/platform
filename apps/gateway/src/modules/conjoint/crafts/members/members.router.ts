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
import { CreateMemberDto, UpdateMemberDto } from '@app/common/dto/conjoint';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Member } from '@app/common/interfaces/conjoint';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type MemberSchema = Record<keyof Member, ZodType>;

const MEMBER_SCHEMA: Partial<MemberSchema> = {
  channel: z.string(),
  account: z.string(),

  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
};

const MEMBER_INPUT_SCHEMA: Partial<MemberSchema> = { ...MEMBER_SCHEMA, ...CORE_INPUT_SCHEMA };
const MEMBER_OUTPUT_SCHEMA: Partial<MemberSchema> = { ...MEMBER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ConjointMember

mcp.server.registerTool(
  'count_conjoint_members',
  {
    title: 'Count ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_conjoint_members', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.conjoint.members.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ConjointMember

mcp.server.registerTool(
  'create_conjoint_members',
  {
    title: 'Create ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: MEMBER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: MEMBER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_conjoint_members', requestInfo, args);

      const payload = args.body as CreateMemberDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.members.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Member with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ConjointMember

mcp.server.registerTool(
  'create-bulk_conjoint_members',
  {
    title: 'Create Bulk ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(MEMBER_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(MEMBER_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_conjoint_members', requestInfo, args);

      const payload = args.body as { items: CreateMemberDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.members.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ConjointMember

mcp.server.registerTool(
  'find_conjoint_members',
  {
    title: 'Find ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(MEMBER_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_conjoint_members', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.conjoint.members.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ConjointMember

mcp.server.registerTool(
  'find-one_conjoint_members',
  {
    title: 'Find One ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MEMBER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_conjoint_members', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.members.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Member found successfully.` : `Member not found.` }],
      };
    }),
);

// Delete One ConjointMember

mcp.server.registerTool(
  'delete-one_conjoint_members',
  {
    title: 'Delete One ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MEMBER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_conjoint_members', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.members.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Member deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ConjointMember

mcp.server.registerTool(
  'restore-one_conjoint_members',
  {
    title: 'Restore One ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MEMBER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_conjoint_members', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.members.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Member restored successfully.` }],
      };
    }),
);

// Destroy One ConjointMember

mcp.server.registerTool(
  'destroy-one_conjoint_members',
  {
    title: 'Destroy One ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MEMBER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_conjoint_members', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.members.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Member destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ConjointMember

mcp.server.registerTool(
  'update-bulk_conjoint_members',
  {
    title: 'Update Bulk ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: MEMBER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_conjoint_members', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateMemberDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.conjoint.members.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ConjointMember

mcp.server.registerTool(
  'update-one_conjoint_members',
  {
    title: 'Update One ConjointMember',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: MEMBER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: MEMBER_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_conjoint_members', requestInfo, args);

      const payload = args.body as UpdateMemberDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.members.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Member updated successfully.` }],
      };
    }),
);
