import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ProfileType } from '@app/common/enums/identity';
import { Gender, State } from '@app/common/core/enums';
import { z } from 'zod';

const PROFILE_SCHEMA = {
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

registerCollectionTools({
  service: 'identity',
  collection: 'profiles',
  entityName: 'IdentityProfile',
  serviceDoc: 'docs://service/identity-specification',
  inputSchema: { ...PROFILE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...PROFILE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.identity.profiles,
});
