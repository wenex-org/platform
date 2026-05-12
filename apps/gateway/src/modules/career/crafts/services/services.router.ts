import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { LocationRange, ServiceType } from '@app/common/enums/career';
import { Service } from '@app/common/interfaces/career';
import { State, Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type ServiceSchema = Record<keyof Service, ZodType>;
const SERVICE_SCHEMA: Partial<ServiceSchema> = {
  type: z.nativeEnum(ServiceType),
  range: z.nativeEnum(LocationRange).optional(),

  name: z.string(),

  state: z.nativeEnum(State),
  status: z.nativeEnum(Status),

  branch: z.string().optional(),
  business: z.string(),

  location: z.string().optional(),
  categories: z.array(z.string()).optional(),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  currency: z.string().optional(),

  unit: z.string().optional(),
  price: z.number().optional(),
  profit: z.number().optional(),
  discount: z.number().optional(),
};

const SERVICE_INPUT_SCHEMA: Partial<ServiceSchema> = { ...SERVICE_SCHEMA, ...CORE_INPUT_SCHEMA };
const SERVICE_OUTPUT_SCHEMA: Partial<ServiceSchema> = { ...SERVICE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'career',
  collection: 'services',
  entityName: 'CareerService',
  inputSchema: SERVICE_INPUT_SCHEMA,
  outputSchema: SERVICE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.services,
});
