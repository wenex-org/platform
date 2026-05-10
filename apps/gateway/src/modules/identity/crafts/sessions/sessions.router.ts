import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const SESSION_SCHEMA = {
  ip: z.string(),
  agent: z.string(),
  expiration: z.number(),
};

registerCollectionTools({
  service: 'identity',
  collection: 'sessions',
  entityName: 'IdentitySession',
  serviceDoc: 'docs://service/identity-specification',
  inputSchema: { ...SESSION_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...SESSION_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.identity.sessions,
});
