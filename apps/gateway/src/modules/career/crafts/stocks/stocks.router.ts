import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State, Status } from '@app/common/core/enums';
import { Stock } from '@app/common/interfaces/career';
import { StockType } from '@app/common/enums/career';
import { z, ZodType } from 'zod';

type StockSchema = Record<keyof Stock, ZodType>;
const STOCK_SCHEMA: Partial<StockSchema> = {
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

const STOCK_INPUT_SCHEMA: Partial<StockSchema> = { ...STOCK_SCHEMA, ...CORE_INPUT_SCHEMA };
const STOCK_OUTPUT_SCHEMA: Partial<StockSchema> = { ...STOCK_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'career',
  collection: 'stocks',
  entityName: 'CareerStock',
  inputSchema: STOCK_INPUT_SCHEMA,
  outputSchema: STOCK_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.stocks,
});
