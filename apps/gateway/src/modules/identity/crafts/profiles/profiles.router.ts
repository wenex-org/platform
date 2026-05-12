import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Profile } from '@app/common/interfaces/identity';
import { ProfileType } from '@app/common/enums/identity';
import { Gender, State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type ProfileSchema = Record<keyof Profile, ZodType>;
const PROFILE_SCHEMA: Partial<ProfileSchema> = {
  type: z.nativeEnum(ProfileType),
  gender: z.nativeEnum(Gender),

  state: z.nativeEnum(State),

  cover: z.string().optional(),
  avatar: z.string().optional(),
  gallery: z.array(z.string()).optional(),

  nickname: z.string().optional(),
  last_name: z.string().optional(),
  first_name: z.string().optional(),
  middle_name: z.string().optional(),

  nationality: z.string().optional(),
  national_code: z.string().optional(),

  verified_at: z.string().optional(),
  verified_by: z.string().optional(),
  verified_in: z.string().optional(),

  birthdate: z.string().optional(),
};

const PROFILE_INPUT_SCHEMA: Partial<ProfileSchema> = { ...PROFILE_SCHEMA, ...CORE_INPUT_SCHEMA };
const PROFILE_OUTPUT_SCHEMA: Partial<ProfileSchema> = { ...PROFILE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'identity',
  collection: 'profiles',
  entityName: 'IdentityProfile',
  inputSchema: PROFILE_INPUT_SCHEMA,
  outputSchema: PROFILE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/identity-specification',
  getRestfulService: (platform) => platform.identity.profiles,
});
