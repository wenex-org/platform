import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { AccountType, AccountOwnership } from '@app/common/enums/financial';
import { Account } from '@app/common/interfaces/financial';
import { z, ZodType } from 'zod';

type AccountSchema = Record<keyof Account, ZodType>;
const ACCOUNT_SCHEMA: Partial<AccountSchema> = {
  type: z.nativeEnum(AccountType),
  ownership: z.nativeEnum(AccountOwnership),
  members: z.array(z.string()).optional(),
};

const ACCOUNT_INPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_INPUT_SCHEMA };
const ACCOUNT_OUTPUT_SCHEMA: Partial<AccountSchema> = { ...ACCOUNT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'financial',
  collection: 'accounts',
  entityName: 'FinancialAccount',
  inputSchema: ACCOUNT_INPUT_SCHEMA,
  outputSchema: ACCOUNT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/financial-specification',
  getRestfulService: (platform) => platform.financial.accounts,
});
