import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Gender, State, Status } from '@app/common/core/enums';
import { Driver } from '@app/common/interfaces/logistic';
import { DriverType } from '@app/common/enums/logistic';
import { z, ZodType } from 'zod';

type DriverSchema = Record<keyof Driver, ZodType>;
const DRIVER_SCHEMA: Partial<DriverSchema> = {
  type: z.nativeEnum(DriverType),
  gender: z.nativeEnum(Gender),

  state: z.nativeEnum(State),
  status: z.nativeEnum(Status),

  license: z.string(),

  verified_at: z.string().optional(),
  verified_by: z.string().optional(),
  verified_in: z.string().optional(),

  expiration_date: z.string(),
};

const DRIVER_INPUT_SCHEMA: Partial<DriverSchema> = { ...DRIVER_SCHEMA, ...CORE_INPUT_SCHEMA };
const DRIVER_OUTPUT_SCHEMA: Partial<DriverSchema> = { ...DRIVER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'logistic',
  collection: 'drivers',
  entityName: 'LogisticDriver',
  inputSchema: DRIVER_INPUT_SCHEMA,
  outputSchema: DRIVER_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/logistic-specification',
  getRestfulService: (platform) => platform.logistic.drivers,
});
