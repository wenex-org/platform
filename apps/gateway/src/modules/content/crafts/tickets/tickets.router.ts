import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { TicketPriority, TicketStatus } from '@app/common/enums/content';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const TICKET_SCHEMA = {
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

registerCollectionTools({
  service: 'content',
  collection: 'tickets',
  entityName: 'ContentTicket',
  serviceDoc: 'docs://service/content-specification',
  inputSchema: { ...TICKET_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...TICKET_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.content.tickets,
});
