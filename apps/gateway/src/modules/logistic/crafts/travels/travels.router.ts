import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Travel } from '@app/common/interfaces/logistic';
import { z, ZodType } from 'zod';

type TravelSchema = Record<keyof Travel, ZodType>;
const TRAVEL_SCHEMA: Partial<TravelSchema> = {
  cargoes: z.array(z.string()).optional(),
  drivers: z.array(z.string()).optional(),
  vehicles: z.array(z.string()).optional(),

  locations: z.array(z.string()),
};

const TRAVEL_INPUT_SCHEMA: Partial<TravelSchema> = { ...TRAVEL_SCHEMA, ...CORE_INPUT_SCHEMA };
const TRAVEL_OUTPUT_SCHEMA: Partial<TravelSchema> = { ...TRAVEL_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'logistic',
  collection: 'travels',
  entityName: 'LogisticTravel',
  inputSchema: TRAVEL_INPUT_SCHEMA,
  outputSchema: TRAVEL_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/logistic-specification',
  getRestfulService: (platform) => platform.logistic.travels,
});
