import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Account } from '@app/common/interfaces/conjoint';
import { AccountType } from '@app/common/enums/conjoint';
import { z, ZodType } from 'zod';

type AccountSchema = Record<keyof Account, ZodType>;
const ACCOUNT_SCHEMA: Partial<AccountSchema> = {
  type: z.nativeEnum(AccountType),

  profile: z.string().optional(),

  bio: z.string().optional(),
  status: z.string().optional(),
};

const ACCOUNT_INPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_INPUT_SCHEMA };
const ACCOUNT_OUTPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'conjoint',
  collection: 'accounts',
  entityName: 'ConjointAccount',
  inputSchema: ACCOUNT_INPUT_SCHEMA,
  outputSchema: ACCOUNT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/conjoint-specification',
  getRestfulService: (platform) => platform.conjoint.accounts,
});
