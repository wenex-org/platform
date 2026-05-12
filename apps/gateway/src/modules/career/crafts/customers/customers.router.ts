import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { CustomerType, LocationRange } from '@app/common/enums/career';
import { Customer } from '@app/common/interfaces/career';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type CustomerSchema = Record<keyof Customer, ZodType>;
const CUSTOMER_SCHEMA: Partial<CustomerSchema> = {
  type: z.nativeEnum(CustomerType),

  range: z.nativeEnum(LocationRange).optional(),

  profile: z.string().optional(),

  branch: z.string().optional(),
  business: z.string(),

  location: z.string().optional(),
  addresses: z.array(z.string()).optional(),

  stores: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  employees: z.array(z.string()).optional(),

  status: z.nativeEnum(Status).optional(),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  documents: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
};

const CUSTOMER_INPUT_SCHEMA: Partial<CustomerSchema> = { ...CUSTOMER_SCHEMA, ...CORE_INPUT_SCHEMA };
const CUSTOMER_OUTPUT_SCHEMA: Partial<CustomerSchema> = { ...CUSTOMER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'career',
  collection: 'customers',
  entityName: 'CareerCustomer',
  inputSchema: CUSTOMER_INPUT_SCHEMA,
  outputSchema: CUSTOMER_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.customers,
});
