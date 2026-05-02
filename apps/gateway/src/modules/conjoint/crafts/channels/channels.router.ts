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
import { CreateChannelDto, UpdateChannelDto } from '@app/common/dto/conjoint';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Channel } from '@app/common/interfaces/conjoint';
import { ChannelScope, ChannelType } from '@app/common/enums/conjoint';
import { z, ZodType } from 'zod';
import { State, Status } from '@app/common/core/enums';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ChannelSchema = Record<keyof Channel, ZodType>;

const CHANNEL_SCHEMA: Partial<ChannelSchema> = {
  type: z.nativeEnum(ChannelType),
  scope: z.nativeEnum(ChannelScope),

  name: z.string().optional(),
  title: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),

  profile: z.string().optional(),
  account: z.string().optional(),
  pinned_messages: z.array(z.string()).optional(),
};

const CHANNEL_INPUT_SCHEMA: Partial<ChannelSchema> = { ...CHANNEL_SCHEMA, ...CORE_INPUT_SCHEMA };
const CHANNEL_OUTPUT_SCHEMA: Partial<ChannelSchema> = { ...CHANNEL_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ConjointChannel

mcp.server.registerTool(
  'count_conjoint_channels',
  {
    title: 'Count ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_conjoint_channels', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.conjoint.channels.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ConjointChannel

mcp.server.registerTool(
  'create_conjoint_channels',
  {
    title: 'Create ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: CHANNEL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CHANNEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_conjoint_channels', requestInfo, args);

      const payload = args.body as CreateChannelDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.channels.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Channel with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ConjointChannel

mcp.server.registerTool(
  'create-bulk_conjoint_channels',
  {
    title: 'Create Bulk ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(CHANNEL_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CHANNEL_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_conjoint_channels', requestInfo, args);

      const payload = args.body as { items: CreateChannelDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.channels.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ConjointChannel

mcp.server.registerTool(
  'find_conjoint_channels',
  {
    title: 'Find ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CHANNEL_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_conjoint_channels', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.conjoint.channels.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ConjointChannel

mcp.server.registerTool(
  'find-one_conjoint_channels',
  {
    title: 'Find One ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CHANNEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_conjoint_channels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.channels.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Channel found successfully.` : `Channel not found.` }],
      };
    }),
);

// Delete One ConjointChannel

mcp.server.registerTool(
  'delete-one_conjoint_channels',
  {
    title: 'Delete One ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CHANNEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_conjoint_channels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.channels.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Channel deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ConjointChannel

mcp.server.registerTool(
  'restore-one_conjoint_channels',
  {
    title: 'Restore One ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CHANNEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_conjoint_channels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.channels.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Channel restored successfully.` }],
      };
    }),
);

// Destroy One ConjointChannel

mcp.server.registerTool(
  'destroy-one_conjoint_channels',
  {
    title: 'Destroy One ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CHANNEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_conjoint_channels', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.channels.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Channel destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ConjointChannel

mcp.server.registerTool(
  'update-bulk_conjoint_channels',
  {
    title: 'Update Bulk ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: CHANNEL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_conjoint_channels', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateChannelDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.conjoint.channels.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ConjointChannel

mcp.server.registerTool(
  'update-one_conjoint_channels',
  {
    title: 'Update One ConjointChannel',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: CHANNEL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CHANNEL_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_conjoint_channels', requestInfo, args);

      const payload = args.body as UpdateChannelDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.channels.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Channel updated successfully.` }],
      };
    }),
);
