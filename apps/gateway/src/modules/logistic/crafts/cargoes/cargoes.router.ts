import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const CARGO_SCHEMA = {
  title: z.string().optional(),
  weight: z.number(),
  width: z.number(),
  height: z.number(),
  length: z.number(),
  fragile: z.boolean().optional(),
  perishable: z.boolean().optional(),
  travels: z.array(z.string()).optional(),
};

registerCollectionTools({
  service: 'logistic',
  collection: 'cargoes',
  entityName: 'LogisticCargo',
  serviceDoc: 'docs://service/logistic-specification',
  inputSchema: { ...CARGO_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...CARGO_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.logistic.cargoes,
});
