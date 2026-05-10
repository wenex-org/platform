import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { AccountType } from '@app/common/enums/conjoint';
import { z } from 'zod';

const ACCOUNT_SCHEMA = {
  type: z.nativeEnum(AccountType),
  profile: z.string().optional(),
  bio: z.string().optional(),
  status: z.string().optional(),
};

registerCollectionTools({
  service: 'conjoint',
  collection: 'accounts',
  entityName: 'ConjointAccount',
  serviceDoc: 'docs://service/conjoint-specification',
  inputSchema: { ...ACCOUNT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...ACCOUNT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.conjoint.accounts,
});
