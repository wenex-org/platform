import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Vehicle } from '@app/common/interfaces/logistic';
import { VehicleType } from '@app/common/enums/logistic';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type VehicleSchema = Record<keyof Vehicle, ZodType>;
const VEHICLE_SCHEMA: Partial<VehicleSchema> = {
  type: z.nativeEnum(VehicleType),

  status: z.nativeEnum(Status),

  plates: z.array(z.string()),
  drivers: z.array(z.string()).optional(),
};

const VEHICLE_INPUT_SCHEMA: Partial<VehicleSchema> = { ...VEHICLE_SCHEMA, ...CORE_INPUT_SCHEMA };
const VEHICLE_OUTPUT_SCHEMA: Partial<VehicleSchema> = { ...VEHICLE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'logistic',
  collection: 'vehicles',
  entityName: 'LogisticVehicle',
  inputSchema: VEHICLE_INPUT_SCHEMA,
  outputSchema: VEHICLE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/logistic-specification',
  getRestfulService: (platform) => platform.logistic.vehicles,
});
