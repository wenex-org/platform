import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State, Status } from '@app/common/core/enums';
import { z } from 'zod';

const SENSOR_SCHEMA = {
  device: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),
  unit: z.string().optional(),
  metric: z.string().optional(),
};

registerCollectionTools({
  service: 'thing',
  collection: 'sensors',
  entityName: 'ThingSensor',
  serviceDoc: 'docs://service/thing-specification',
  inputSchema: { ...SENSOR_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...SENSOR_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.thing.sensors,
});
