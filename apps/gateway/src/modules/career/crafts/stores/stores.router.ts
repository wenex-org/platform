import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { LocationRange, StoreFork, StoreType } from '@app/common/enums/career';
import { State, Status } from '@app/common/core/enums';
import { Store } from '@app/common/interfaces/career';
import { z, ZodType } from 'zod';

type StoreSchema = Record<keyof Store, ZodType>;
const STORE_SCHEMA: Partial<StoreSchema> = {
  name: z.string(),

  type: z.nativeEnum(StoreType),
  fork: z.nativeEnum(StoreFork),

  range: z.nativeEnum(LocationRange).optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status),

  parent: z.string().optional(),
  manager: z.string().optional(),
  business: z.string(),

  categories: z.array(z.string()).optional(),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  phone: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
};

const STORE_INPUT_SCHEMA: Partial<StoreSchema> = { ...STORE_SCHEMA, ...CORE_INPUT_SCHEMA };
const STORE_OUTPUT_SCHEMA: Partial<StoreSchema> = { ...STORE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'career',
  collection: 'stores',
  entityName: 'CareerStore',
  inputSchema: STORE_INPUT_SCHEMA,
  outputSchema: STORE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.stores,
});
