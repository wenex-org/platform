import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State, Status } from '@app/common/core/enums';
import { Sensor } from '@app/common/interfaces/thing';
import { z, ZodType } from 'zod';

type SensorSchema = Record<keyof Sensor, ZodType>;
const SENSOR_SCHEMA: Partial<SensorSchema> = {
  device: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),

  unit: z.string().optional(),
  metric: z.string().optional(),
};

const SENSOR_INPUT_SCHEMA: Partial<SensorSchema> = { ...SENSOR_SCHEMA, ...CORE_INPUT_SCHEMA };
const SENSOR_OUTPUT_SCHEMA: Partial<SensorSchema> = { ...SENSOR_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'thing',
  collection: 'sensors',
  entityName: 'ThingSensor',
  inputSchema: SENSOR_INPUT_SCHEMA,
  outputSchema: SENSOR_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/thing-specification',
  getRestfulService: (platform) => platform.thing.sensors,
});
