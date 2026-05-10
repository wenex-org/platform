import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { DriverType } from '@app/common/enums/logistic';
import { Gender, State, Status } from '@app/common/core/enums';
import { z } from 'zod';

const DRIVER_SCHEMA = {
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

registerCollectionTools({
  service: 'logistic',
  collection: 'drivers',
  entityName: 'LogisticDriver',
  serviceDoc: 'docs://service/logistic-specification',
  inputSchema: { ...DRIVER_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...DRIVER_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.logistic.drivers,
});
