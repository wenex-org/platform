import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Product, ProductFeature } from '@app/common/interfaces/career';
import { ProductFeatureType } from '@app/common/enums/career';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type ProductFeatureSchema = Record<keyof ProductFeature, ZodType>;
const FEATURE_SCHEMA: Partial<ProductFeatureSchema> = {
  type: z.nativeEnum(ProductFeatureType),

  title: z.string(),
  value: z.union([z.boolean(), z.number(), z.string()]),

  ...CORE_INPUT_SCHEMA,
};

type ProductSchema = Record<keyof Product, ZodType>;
const PRODUCT_SCHEMA: Partial<ProductSchema> = {
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

const PRODUCT_INPUT_SCHEMA: Partial<ProductSchema> = { ...PRODUCT_SCHEMA, ...CORE_INPUT_SCHEMA };
const PRODUCT_OUTPUT_SCHEMA: Partial<ProductSchema> = { ...PRODUCT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'career',
  collection: 'products',
  entityName: 'CareerProduct',
  inputSchema: PRODUCT_INPUT_SCHEMA,
  outputSchema: PRODUCT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.products,
});
