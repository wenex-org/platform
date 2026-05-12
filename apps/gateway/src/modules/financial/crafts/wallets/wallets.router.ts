import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Wallet } from '@app/common/interfaces/financial';
import { z, ZodType } from 'zod';

type WalletSchema = Record<keyof Wallet, ZodType>;
const WALLET_SCHEMA: Partial<WalletSchema> = {
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

const WALLET_INPUT_SCHEMA: Partial<WalletSchema> = { ...WALLET_SCHEMA, ...CORE_INPUT_SCHEMA };
const WALLET_OUTPUT_SCHEMA: Partial<WalletSchema> = { ...WALLET_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'financial',
  collection: 'wallets',
  entityName: 'FinancialWallet',
  inputSchema: WALLET_INPUT_SCHEMA,
  outputSchema: WALLET_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/financial-specification',
  getRestfulService: (platform) => platform.financial.wallets,
});
