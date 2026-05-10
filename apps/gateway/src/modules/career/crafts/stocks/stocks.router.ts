import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { StockType } from '@app/common/enums/career';
import { State, Status } from '@app/common/core/enums';
import { z } from 'zod';

const STOCK_SCHEMA = {
  type: z.nativeEnum(StockType),
  name: z.string().optional(),
  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),
  product: z.string(),
  feature: z.string().optional(),
  store: z.string().optional(),
  branch: z.string().optional(),
  business: z.string().optional(),
  capacity: z.number().optional(),
  inventory: z.number(),
  place: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  threshold: z.number().optional(),
  currency: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().optional(),
  profit: z.number().optional(),
  discount: z.number().optional(),
};

registerCollectionTools({
  service: 'career',
  collection: 'stocks',
  entityName: 'CareerStock',
  serviceDoc: 'docs://service/career-specification',
  inputSchema: { ...STOCK_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...STOCK_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.career.stocks,
});
