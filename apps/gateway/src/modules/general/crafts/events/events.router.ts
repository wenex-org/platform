import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const EVENT_SCHEMA = {
  title: z.string(),
  subtitle: z.string().optional(),
  s_date: z.string(),
  e_date: z.string(),
  place: z.string().optional(),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  organizers: z.array(z.string()).optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  correlation: z.string().optional(),
};

registerCollectionTools({
  service: 'general',
  collection: 'events',
  entityName: 'GeneralEvent',
  serviceDoc: 'docs://service/general-specification',
  inputSchema: { ...EVENT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...EVENT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.general.events,
});
