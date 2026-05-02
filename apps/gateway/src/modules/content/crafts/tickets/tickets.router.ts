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
import { CreateTicketDto, UpdateTicketDto } from '@app/common/dto/content';
import { TicketPriority, TicketStatus } from '@app/common/enums/content';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Ticket } from '@app/common/interfaces/content';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type TicketSchema = Record<keyof Ticket, ZodType>;

const TICKET_SCHEMA: Partial<TicketSchema> = {
  title: z.string(),
  type: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(TicketStatus),
  priority: z.nativeEnum(TicketPriority),

  parent: z.string().optional(),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  content: z.string(),
  department: z.string().optional(),

  due_date: z.string().optional(),

  assigned_to: z.string().optional(),

  solution: z.string().optional(),
  attachments: z.array(z.string()).optional(),

  feedback: z.string().optional(),
  related_tickets: z.array(z.string()).optional(),
};

const TICKET_INPUT_SCHEMA: Partial<TicketSchema> = { ...TICKET_SCHEMA, ...CORE_INPUT_SCHEMA };
const TICKET_OUTPUT_SCHEMA: Partial<TicketSchema> = { ...TICKET_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ContentTicket

mcp.server.registerTool(
  'count_content_tickets',
  {
    title: 'Count ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_content_tickets', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.content.tickets.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ContentTicket

mcp.server.registerTool(
  'create_content_tickets',
  {
    title: 'Create ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ body: TICKET_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TICKET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_content_tickets', requestInfo, args);

      const payload = args.body as CreateTicketDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.content.tickets.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Ticket with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ContentTicket

mcp.server.registerTool(
  'create-bulk_content_tickets',
  {
    title: 'Create Bulk ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(TICKET_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(TICKET_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_content_tickets', requestInfo, args);

      const payload = args.body as { items: CreateTicketDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.content.tickets.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ContentTicket

mcp.server.registerTool(
  'find_content_tickets',
  {
    title: 'Find ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(TICKET_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_content_tickets', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.content.tickets.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ContentTicket

mcp.server.registerTool(
  'find-one_content_tickets',
  {
    title: 'Find One ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TICKET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_content_tickets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.tickets.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Ticket found successfully.` : `Ticket not found.` }],
      };
    }),
);

// Delete One ContentTicket

mcp.server.registerTool(
  'delete-one_content_tickets',
  {
    title: 'Delete One ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TICKET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_content_tickets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.tickets.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Ticket deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ContentTicket

mcp.server.registerTool(
  'restore-one_content_tickets',
  {
    title: 'Restore One ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TICKET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_content_tickets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.tickets.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Ticket restored successfully.` }],
      };
    }),
);

// Destroy One ContentTicket

mcp.server.registerTool(
  'destroy-one_content_tickets',
  {
    title: 'Destroy One ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: TICKET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_content_tickets', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.tickets.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Ticket destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ContentTicket

mcp.server.registerTool(
  'update-bulk_content_tickets',
  {
    title: 'Update Bulk ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: TICKET_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_content_tickets', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateTicketDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.content.tickets.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ContentTicket

mcp.server.registerTool(
  'update-one_content_tickets',
  {
    title: 'Update One ContentTicket',
    description: `Read "docs://service/content-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: TICKET_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TICKET_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_content_tickets', requestInfo, args);

      const payload = args.body as UpdateTicketDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.content.tickets.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Ticket updated successfully.` }],
      };
    }),
);
