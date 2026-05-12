import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Event } from '@app/common/interfaces/general';
import { z, ZodType } from 'zod';

type EventSchema = Record<keyof Event, ZodType>;
const EVENT_SCHEMA: Partial<EventSchema> = {
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

const EVENT_INPUT_SCHEMA: Partial<EventSchema> = { ...EVENT_SCHEMA, ...CORE_INPUT_SCHEMA };
const EVENT_OUTPUT_SCHEMA: Partial<EventSchema> = { ...EVENT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'general',
  collection: 'events',
  entityName: 'GeneralEvent',
  inputSchema: EVENT_INPUT_SCHEMA,
  outputSchema: EVENT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/general-specification',
  getRestfulService: (platform) => platform.general.events,
});
