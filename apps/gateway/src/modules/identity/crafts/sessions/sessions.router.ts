import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Session } from '@app/common/interfaces/identity';
import { z, ZodType } from 'zod';

type SessionSchema = Record<keyof Session, ZodType>;
const SESSION_SCHEMA: Partial<SessionSchema> = {
  ip: z.string(),
  agent: z.string(),
  expiration: z.number(),
};

const SESSION_INPUT_SCHEMA: Partial<SessionSchema> = { ...SESSION_SCHEMA, ...CORE_INPUT_SCHEMA };
const SESSION_OUTPUT_SCHEMA: Partial<SessionSchema> = { ...SESSION_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'identity',
  collection: 'sessions',
  entityName: 'IdentitySession',
  inputSchema: SESSION_INPUT_SCHEMA,
  outputSchema: SESSION_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/identity-specification',
  getRestfulService: (platform) => platform.identity.sessions,
});
