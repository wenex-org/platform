import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const TRAVEL_SCHEMA = {
  cargoes: z.array(z.string()).optional(),
  drivers: z.array(z.string()).optional(),
  vehicles: z.array(z.string()).optional(),
  locations: z.array(z.string()),
};

registerCollectionTools({
  service: 'logistic',
  collection: 'travels',
  entityName: 'LogisticTravel',
  serviceDoc: 'docs://service/logistic-specification',
  inputSchema: { ...TRAVEL_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...TRAVEL_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.logistic.travels,
});
