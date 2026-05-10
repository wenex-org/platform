import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, PAY_SCHEMA } from '@app/common/core/mcp';
import { TransactionType, TransactionState, TransactionReason } from '@app/common/enums/financial';
import { z } from 'zod';

const TRANSACTION_SCHEMA = {
  saga: z.string(),
  type: z.nativeEnum(TransactionType),
  state: z.nativeEnum(TransactionState),
  reason: z.nativeEnum(TransactionReason),
  amount: z.number(),
  payees: z.array(z.object(PAY_SCHEMA)).optional(),
  payers: z.array(z.object(PAY_SCHEMA)).optional(),
  failed_at: z.string().optional(),
  verified_at: z.string().optional(),
  canceled_at: z.string().optional(),
  invoice: z.string().optional(),
};

registerCollectionTools({
  service: 'financial',
  collection: 'transactions',
  entityName: 'FinancialTransaction',
  serviceDoc: 'docs://service/financial-specification',
  inputSchema: { ...TRANSACTION_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...TRANSACTION_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.financial.transactions,
});
