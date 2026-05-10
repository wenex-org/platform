import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { CurrencyType, CurrencyProvider, CurrencyCategory, CurrencyLib } from '@app/common/enums/financial';
import { z } from 'zod';

const UNIT_SCHEMA = {
  name: z.string(),
  rate: z.number(),
  symbol: z.string().optional(),
  precision: z.number().optional(),
};

const CURRENCY_SCHEMA = {
  type: z.nativeEnum(CurrencyType),
  provider: z.nativeEnum(CurrencyProvider),
  code: z.string().optional(),
  symbol: z.string(),
  precision: z.number(),
  countries: z.array(z.string()).optional(),
  name: z.string().optional(),
  token: z.string().optional(),
  explore: z.string().optional(),
  network: z.string().optional(),
  contract: z.string().optional(),
  subunits: z.array(z.object(UNIT_SCHEMA)).optional(),
  category: z.nativeEnum(CurrencyCategory).optional(),
  lib: z.nativeEnum(CurrencyLib),
  nodes: z.array(z.string()).optional(),
};

registerCollectionTools({
  service: 'financial',
  collection: 'currencies',
  entityName: 'FinancialCurrency',
  serviceDoc: 'docs://service/financial-specification',
  inputSchema: { ...CURRENCY_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...CURRENCY_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.financial.currencies,
});
