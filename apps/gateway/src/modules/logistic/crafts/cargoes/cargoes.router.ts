import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Cargo } from '@app/common/interfaces/logistic';
import { z, ZodType } from 'zod';

type CargoSchema = Record<keyof Cargo, ZodType>;
const CARGO_SCHEMA: Partial<CargoSchema> = {
  title: z.string().optional(),

  weight: z.number(),

  width: z.number(),
  height: z.number(),
  length: z.number(),

  fragile: z.boolean().optional(),
  perishable: z.boolean().optional(),

  travels: z.array(z.string()).optional(),
};

const CARGO_INPUT_SCHEMA: Partial<CargoSchema> = { ...CARGO_SCHEMA, ...CORE_INPUT_SCHEMA };
const CARGO_OUTPUT_SCHEMA: Partial<CargoSchema> = { ...CARGO_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'logistic',
  collection: 'cargoes',
  entityName: 'LogisticCargo',
  inputSchema: CARGO_INPUT_SCHEMA,
  outputSchema: CARGO_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/logistic-specification',
  getRestfulService: (platform) => platform.logistic.cargoes,
});
