import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { VehicleType } from '@app/common/enums/logistic';
import { Status } from '@app/common/core/enums';
import { z } from 'zod';

const VEHICLE_SCHEMA = {
  type: z.nativeEnum(VehicleType),
  status: z.nativeEnum(Status),
  plates: z.array(z.string()),
  drivers: z.array(z.string()).optional(),
};

registerCollectionTools({
  service: 'logistic',
  collection: 'vehicles',
  entityName: 'LogisticVehicle',
  serviceDoc: 'docs://service/logistic-specification',
  inputSchema: { ...VEHICLE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...VEHICLE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.logistic.vehicles,
});
