import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ProductFeatureType } from '@app/common/enums/career';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const FEATURE_SCHEMA = {
  type: z.nativeEnum(ProductFeatureType),
  title: z.string(),
  value: z.union([z.boolean(), z.number(), z.string()]),
  ...CORE_INPUT_SCHEMA,
};

const PRODUCT_SCHEMA = {
  name: z.string(),
  alias: z.string().optional(),
  state: z.nativeEnum(State),
  store: z.string().optional(),
  branch: z.string().optional(),
  business: z.string().optional(),
  brand: z.string().optional(),
  content: z.string().optional(),
  cover: z.string().optional(),
  gallery: z.array(z.string()),
  categories: z.array(z.string()),
  rate: z.number(),
  votes: z.number(),
  rating: z.number(),
  features: z.array(z.object(FEATURE_SCHEMA)).optional(),
};

registerCollectionTools({
  service: 'career',
  collection: 'products',
  entityName: 'CareerProduct',
  serviceDoc: 'docs://service/career-specification',
  inputSchema: { ...PRODUCT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...PRODUCT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.career.products,
});
