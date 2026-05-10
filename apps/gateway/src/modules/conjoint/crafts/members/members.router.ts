import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const MEMBER_SCHEMA = {
  channel: z.string(),
  account: z.string(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
};

registerCollectionTools({
  service: 'conjoint',
  collection: 'members',
  entityName: 'ConjointMember',
  serviceDoc: 'docs://service/conjoint-specification',
  inputSchema: { ...MEMBER_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...MEMBER_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.conjoint.members,
});
