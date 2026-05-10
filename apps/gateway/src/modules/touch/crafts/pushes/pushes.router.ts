import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const KEYS_SCHEMA = {
  auth: z.string(),
  p256dh: z.string(),
};

const PUSH_SCHEMA = {
  session: z.string(),
  keys: z.object(KEYS_SCHEMA),
  endpoint: z.string(),
  blacklist: z.string().optional(),
  expiration: z.number(),
};

registerCollectionTools({
  service: 'touch',
  collection: 'pushes',
  entityName: 'TouchPush',
  serviceDoc: 'docs://service/touch-specification',
  inputSchema: { ...PUSH_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...PUSH_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.touch.pushes,
});
