import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
} from '@app/common/core/mcp';
import { CurrencyType, CurrencyProvider, CurrencyCategory, CurrencyLib } from '@app/common/enums/financial';
import { CreateCurrencyDto, UpdateCurrencyDto } from '@app/common/dto/financial';
import { Currency, CurrencyUnit } from '@app/common/interfaces/financial';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

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

// Count FinancialCurrency

mcp.server.registerTool(
  'count_financial_currencies',
  {
    title: 'Count FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_financial_currencies', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.financial.currencies.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create FinancialCurrency

mcp.server.registerTool(
  'create_financial_currencies',
  {
    title: 'Create FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: CURRENCY_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CURRENCY_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_financial_currencies', requestInfo, args);

      const payload = args.body as CreateCurrencyDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.currencies.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Currency with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk FinancialCurrency

mcp.server.registerTool(
  'create-bulk_financial_currencies',
  {
    title: 'Create Bulk FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(CURRENCY_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CURRENCY_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_financial_currencies', requestInfo, args);

      const payload = args.body as { items: CreateCurrencyDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.currencies.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find FinancialCurrency

mcp.server.registerTool(
  'find_financial_currencies',
  {
    title: 'Find FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CURRENCY_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_financial_currencies', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.financial.currencies.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One FinancialCurrency

mcp.server.registerTool(
  'find-one_financial_currencies',
  {
    title: 'Find One FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CURRENCY_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_financial_currencies', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.currencies.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Currency found successfully.` : `Currency not found.` }],
      };
    }),
);

// Delete One FinancialCurrency

mcp.server.registerTool(
  'delete-one_financial_currencies',
  {
    title: 'Delete One FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CURRENCY_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_financial_currencies', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.currencies.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Currency deleted (soft) successfully.` }],
      };
    }),
);

// Restore One FinancialCurrency

mcp.server.registerTool(
  'restore-one_financial_currencies',
  {
    title: 'Restore One FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CURRENCY_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_financial_currencies', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.currencies.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Currency restored successfully.` }],
      };
    }),
);

// Destroy One FinancialCurrency

mcp.server.registerTool(
  'destroy-one_financial_currencies',
  {
    title: 'Destroy One FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CURRENCY_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_financial_currencies', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.currencies.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Currency destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk FinancialCurrency

mcp.server.registerTool(
  'update-bulk_financial_currencies',
  {
    title: 'Update Bulk FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: CURRENCY_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_financial_currencies', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateCurrencyDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.financial.currencies.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One FinancialCurrency

mcp.server.registerTool(
  'update-one_financial_currencies',
  {
    title: 'Update One FinancialCurrency',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: CURRENCY_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CURRENCY_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_financial_currencies', requestInfo, args);

      const payload = args.body as UpdateCurrencyDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.currencies.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Currency updated successfully.` }],
      };
    }),
);
