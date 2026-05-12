import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Member } from '@app/common/interfaces/conjoint';
import { z, ZodType } from 'zod';

type MemberSchema = Record<keyof Member, ZodType>;
const MEMBER_SCHEMA: Partial<MemberSchema> = {
  channel: z.string(),
  account: z.string(),

  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
};

const MEMBER_INPUT_SCHEMA: Partial<MemberSchema> = { ...MEMBER_SCHEMA, ...CORE_INPUT_SCHEMA };
const MEMBER_OUTPUT_SCHEMA: Partial<MemberSchema> = { ...MEMBER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'conjoint',
  collection: 'members',
  entityName: 'ConjointMember',
  inputSchema: MEMBER_INPUT_SCHEMA,
  outputSchema: MEMBER_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/conjoint-specification',
  getRestfulService: (platform) => platform.conjoint.members,
});
