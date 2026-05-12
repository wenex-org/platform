import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Business } from '@app/common/interfaces/career';
import { BusinessType } from '@app/common/enums/career';
import { State, Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type BusinessSchema = Record<keyof Business, ZodType>;
const BUSINESS_SCHEMA: Partial<BusinessSchema> = {
  name: z.string(),
  type: z.nativeEnum(BusinessType),

  code: z.string().optional(),
  alias: z.string().optional(),

  logo: z.string().optional(),
  cover: z.string().optional(),
  slogan: z.string().optional(),

  state: z.nativeEnum(State),
  status: z.nativeEnum(Status),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  address: z.string().optional(),
  support: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  categories: z.array(z.string()).optional(),

  founder: z.string().optional(),
  co_founders: z.array(z.string()).optional(),

  partners: z.array(z.string()).optional(),
  investors: z.array(z.string()).optional(),
  suppliers: z.array(z.string()).optional(),
  customers: z.array(z.string()).optional(),

  foundation_date: z.string().optional(),
};

const BUSINESS_INPUT_SCHEMA: Partial<BusinessSchema> = { ...BUSINESS_SCHEMA, ...CORE_INPUT_SCHEMA };
const BUSINESS_OUTPUT_SCHEMA: Partial<BusinessSchema> = { ...BUSINESS_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'career',
  collection: 'businesses',
  entityName: 'CareerBusiness',
  inputSchema: BUSINESS_INPUT_SCHEMA,
  outputSchema: BUSINESS_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.businesses,
});
