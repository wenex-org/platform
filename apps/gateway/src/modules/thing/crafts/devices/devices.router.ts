import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State, Status } from '@app/common/core/enums';
import { Device } from '@app/common/interfaces/thing';
import { z, ZodType } from 'zod';

type DeviceSchema = Record<keyof Device, ZodType>;
const DEVICE_SCHEMA: Partial<DeviceSchema> = {
  name: z.string(),

  type: z.string().optional(),
  token: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),

  location: z.string().optional(),
};

const DEVICE_INPUT_SCHEMA: Partial<DeviceSchema> = { ...DEVICE_SCHEMA, ...CORE_INPUT_SCHEMA };
const DEVICE_OUTPUT_SCHEMA: Partial<DeviceSchema> = { ...DEVICE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'thing',
  collection: 'devices',
  entityName: 'ThingDevice',
  inputSchema: DEVICE_INPUT_SCHEMA,
  outputSchema: DEVICE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/thing-specification',
  getRestfulService: (platform) => platform.thing.devices,
});
