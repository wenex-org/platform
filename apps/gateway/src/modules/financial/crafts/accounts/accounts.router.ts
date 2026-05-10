import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { AccountType, AccountOwnership } from '@app/common/enums/financial';
import { z } from 'zod';

const ACCOUNT_SCHEMA = {
  type: z.nativeEnum(AccountType),
  ownership: z.nativeEnum(AccountOwnership),
  members: z.array(z.string()).optional(),
};

registerCollectionTools({
  service: 'financial',
  collection: 'accounts',
  entityName: 'FinancialAccount',
  serviceDoc: 'docs://service/financial-specification',
  inputSchema: { ...ACCOUNT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...ACCOUNT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.financial.accounts,
});
