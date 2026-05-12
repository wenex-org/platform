import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Grant, GrantTime } from '@app/common/interfaces/auth';
import { z, ZodType } from 'zod';

const TIME_SCHEMA: Record<keyof GrantTime, ZodType> = {
  cron_exp: z.string(),
  duration: z.number().positive(),
};

type GrantSchema = Record<keyof Grant, ZodType>;
const GRANT_SCHEMA: Partial<GrantSchema> = {
  subject: z.string(),
  action: z.string(),
  object: z.string(),

  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),

  time: z.array(z.object(TIME_SCHEMA)).optional(),
};

const GRANT_INPUT_SCHEMA: Partial<GrantSchema> = { ...GRANT_SCHEMA, ...CORE_INPUT_SCHEMA };
const GRANT_OUTPUT_SCHEMA: Partial<GrantSchema> = { ...GRANT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'auth',
  collection: 'grants',
  entityName: 'AuthGrant',
  inputSchema: GRANT_INPUT_SCHEMA,
  outputSchema: GRANT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://core/auth-specification',
  getRestfulService: (platform) => platform.auth.grants,
});
