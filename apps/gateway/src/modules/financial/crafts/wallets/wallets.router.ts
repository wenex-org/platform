import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { z } from 'zod';

const WALLET_SCHEMA = {
  strict: z.boolean().optional(),
  account: z.string(),
  currency: z.string(),
  amount: z.number(),
  blocked: z.number().optional(),
  internal: z.number().optional(),
  external: z.number().optional(),
  address: z.string().optional(),
  private: z.string().optional(),
};

registerCollectionTools({
  service: 'financial',
  collection: 'wallets',
  entityName: 'FinancialWallet',
  serviceDoc: 'docs://service/financial-specification',
  inputSchema: { ...WALLET_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...WALLET_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.financial.wallets,
});
