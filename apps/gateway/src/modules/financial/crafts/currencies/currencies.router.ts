import { CurrencyType, CurrencyProvider, CurrencyCategory, CurrencyLib } from '@app/common/enums/financial';
import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Currency, CurrencyUnit } from '@app/common/interfaces/financial';
import { z, ZodType } from 'zod';

const UNIT_SCHEMA: Record<keyof CurrencyUnit, ZodType> = {
  name: z.string(),
  rate: z.number(),
  symbol: z.string().optional(),
  precision: z.number().optional(),
};

type CurrencySchema = Record<keyof Currency, ZodType>;
const CURRENCY_SCHEMA: Partial<CurrencySchema> = {
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

const CURRENCY_INPUT_SCHEMA: Partial<CurrencySchema> = { ...CURRENCY_SCHEMA, ...CORE_INPUT_SCHEMA };
const CURRENCY_OUTPUT_SCHEMA: Partial<CurrencySchema> = { ...CURRENCY_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'financial',
  collection: 'currencies',
  entityName: 'FinancialCurrency',
  inputSchema: CURRENCY_INPUT_SCHEMA,
  outputSchema: CURRENCY_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/financial-specification',
  getRestfulService: (platform) => platform.financial.currencies,
});
