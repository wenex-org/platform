import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { LocationRange, StoreFork, StoreType } from '@app/common/enums/career';
import { State, Status } from '@app/common/core/enums';
import { z } from 'zod';

const STORE_SCHEMA = {
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

registerCollectionTools({
  service: 'career',
  collection: 'stores',
  entityName: 'CareerStore',
  serviceDoc: 'docs://service/career-specification',
  inputSchema: { ...STORE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...STORE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.career.stores,
});
