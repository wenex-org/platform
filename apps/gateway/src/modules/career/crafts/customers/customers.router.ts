import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { CustomerType, LocationRange } from '@app/common/enums/career';
import { Status } from '@app/common/core/enums';
import { z } from 'zod';

const CUSTOMER_SCHEMA = {
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

registerCollectionTools({
  service: 'career',
  collection: 'customers',
  entityName: 'CareerCustomer',
  serviceDoc: 'docs://service/career-specification',
  inputSchema: { ...CUSTOMER_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...CUSTOMER_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.career.customers,
});
