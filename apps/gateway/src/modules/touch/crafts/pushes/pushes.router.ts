import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Push, PushKeys } from '@app/common/interfaces/touch';
import { z, ZodType } from 'zod';

const KEYS_SCHEMA: Record<keyof PushKeys, ZodType> = {
  auth: z.string(),
  p256dh: z.string(),
};

type PushSchema = Record<keyof Push, ZodType>;
const PUSH_SCHEMA: Partial<PushSchema> = {
  session: z.string(),

  keys: z.object(KEYS_SCHEMA),
  endpoint: z.string(),

  blacklist: z.string().optional(),

  expiration: z.number(),
};

const PUSH_INPUT_SCHEMA: Partial<PushSchema> = { ...PUSH_SCHEMA, ...CORE_INPUT_SCHEMA };
const PUSH_OUTPUT_SCHEMA: Partial<PushSchema> = { ...PUSH_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'touch',
  collection: 'pushes',
  entityName: 'TouchPush',
  inputSchema: PUSH_INPUT_SCHEMA,
  outputSchema: PUSH_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/touch-specification',
  getRestfulService: (platform) => platform.touch.pushes,
});
