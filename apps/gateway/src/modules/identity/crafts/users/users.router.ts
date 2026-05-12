import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { User } from '@app/common/interfaces/identity';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type UserSchema = Record<keyof User, ZodType>;
const USER_SCHEMA: Partial<UserSchema> = {
  status: z.nativeEnum(Status),

  tz: z.string(),
  lang: z.string(),
  region: z.string(),

  email: z.string().optional(),
  phone: z.string().optional(),

  username: z.string().optional(),

  subjects: z.array(z.string()).optional(),
};

const USER_INPUT_SCHEMA: Partial<UserSchema> = { ...USER_SCHEMA, ...CORE_INPUT_SCHEMA };
const USER_OUTPUT_SCHEMA: Partial<UserSchema> = { ...USER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'identity',
  collection: 'users',
  entityName: 'IdentityUser',
  inputSchema: USER_INPUT_SCHEMA,
  outputSchema: USER_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/identity-specification',
  getRestfulService: (platform) => platform.identity.users,
});
