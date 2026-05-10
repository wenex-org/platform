import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State, Status } from '@app/common/core/enums';
import { z } from 'zod';

const DEVICE_SCHEMA = {
  name: z.string(),
  type: z.string().optional(),
  token: z.string().optional(),
  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),
  location: z.string().optional(),
};

registerCollectionTools({
  service: 'thing',
  collection: 'devices',
  entityName: 'ThingDevice',
  serviceDoc: 'docs://service/thing-specification',
  inputSchema: { ...DEVICE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...DEVICE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.thing.devices,
});
