import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
  REACTION_SCHEMA,
} from '@app/common/core/mcp';
import { CreateMessageDto, UpdateMessageDto } from '@app/common/dto/conjoint';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Message } from '@app/common/interfaces/conjoint';
import { MessageType } from '@app/common/enums/conjoint';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type MessageSchema = Record<keyof Message, ZodType>;

const MESSAGE_SCHEMA: Partial<MessageSchema> = {
  type: z.nativeEnum(MessageType),

  content: z.any(),

  caption: z.string().optional(),
  channel: z.string().optional(),
  account: z.string().optional(),

  mentions: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),

  reply_to: z.string().optional(),

  edited_at: z.string().optional(),
  delivered_at: z.string().optional(),
  scheduled_at: z.string().optional(),

  views: z.number().optional(),
  visited_at: z.string().optional(),

  originate_from: z.string().optional(),
  forwarded_from: z.string().optional(),

  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

const MESSAGE_INPUT_SCHEMA: Partial<MessageSchema> = { ...MESSAGE_SCHEMA, ...CORE_INPUT_SCHEMA };
const MESSAGE_OUTPUT_SCHEMA: Partial<MessageSchema> = { ...MESSAGE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ConjointMessage

mcp.server.registerTool(
  'count_conjoint_messages',
  {
    title: 'Count ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_conjoint_messages', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.conjoint.messages.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ConjointMessage

mcp.server.registerTool(
  'create_conjoint_messages',
  {
    title: 'Create ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: MESSAGE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: MESSAGE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_conjoint_messages', requestInfo, args);

      const payload = args.body as CreateMessageDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.messages.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Message with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ConjointMessage

mcp.server.registerTool(
  'create-bulk_conjoint_messages',
  {
    title: 'Create Bulk ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(MESSAGE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(MESSAGE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_conjoint_messages', requestInfo, args);

      const payload = args.body as { items: CreateMessageDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.messages.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ConjointMessage

mcp.server.registerTool(
  'find_conjoint_messages',
  {
    title: 'Find ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(MESSAGE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_conjoint_messages', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.conjoint.messages.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ConjointMessage

mcp.server.registerTool(
  'find-one_conjoint_messages',
  {
    title: 'Find One ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MESSAGE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_conjoint_messages', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.messages.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Message found successfully.` : `Message not found.` }],
      };
    }),
);

// Delete One ConjointMessage

mcp.server.registerTool(
  'delete-one_conjoint_messages',
  {
    title: 'Delete One ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MESSAGE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_conjoint_messages', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.messages.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Message deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ConjointMessage

mcp.server.registerTool(
  'restore-one_conjoint_messages',
  {
    title: 'Restore One ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MESSAGE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_conjoint_messages', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.messages.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Message restored successfully.` }],
      };
    }),
);

// Destroy One ConjointMessage

mcp.server.registerTool(
  'destroy-one_conjoint_messages',
  {
    title: 'Destroy One ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: MESSAGE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_conjoint_messages', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.messages.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Message destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ConjointMessage

mcp.server.registerTool(
  'update-bulk_conjoint_messages',
  {
    title: 'Update Bulk ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: MESSAGE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_conjoint_messages', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateMessageDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.conjoint.messages.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ConjointMessage

mcp.server.registerTool(
  'update-one_conjoint_messages',
  {
    title: 'Update One ConjointMessage',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: MESSAGE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: MESSAGE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_conjoint_messages', requestInfo, args);

      const payload = args.body as UpdateMessageDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.messages.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Message updated successfully.` }],
      };
    }),
);
