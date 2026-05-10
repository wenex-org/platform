import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Status } from '@app/common/core/enums';
import { z } from 'zod';

const USER_SCHEMA = {
  status: z.nativeEnum(Status),
  tz: z.string(),
  lang: z.string(),
  region: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  username: z.string().optional(),
  subjects: z.array(z.string()).optional(),
};

registerCollectionTools({
  service: 'identity',
  collection: 'users',
  entityName: 'IdentityUser',
  serviceDoc: 'docs://service/identity-specification',
  inputSchema: { ...USER_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...USER_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.identity.users,
});
