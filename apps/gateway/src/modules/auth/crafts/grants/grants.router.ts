import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const TIME_SCHEMA = {
  cron_exp: z.string(),
  duration: z.number().positive(),
};

const GRANT_SCHEMA = {
  subject: z.string(),
  action: z.string(),
  object: z.string(),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z.array(z.object(TIME_SCHEMA)).optional(),
};

registerCollectionTools({
  service: 'auth',
  collection: 'grants',
  entityName: 'AuthGrant',
  serviceDoc: 'docs://core/auth-specification',
  inputSchema: { ...GRANT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...GRANT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.auth.grants,
});
