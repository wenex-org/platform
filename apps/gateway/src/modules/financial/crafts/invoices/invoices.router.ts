import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
  PAY_SCHEMA,
} from '@app/common/core/mcp';
import { CreateInvoiceDto, UpdateInvoiceDto } from '@app/common/dto/financial';
import { Invoice, InvoiceItem } from '@app/common/interfaces/financial';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { InvoiceType } from '@app/common/enums/financial';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type InvoiceItemSchema = Record<keyof InvoiceItem, ZodType>;

const ITEM_SCHEMA: Partial<InvoiceItemSchema> = {
  title: z.string().optional(),

  price: z.number(),
  quantity: z.number(),

  profit: z.number().optional(),
  discount: z.number().optional(),

  measurement: z.string().optional(),

  ...CORE_INPUT_SCHEMA,
};

type InvoiceSchema = Record<keyof Invoice, ZodType>;

const INVOICE_SCHEMA: Partial<InvoiceSchema> = {
  type: z.nativeEnum(InvoiceType),

  title: z.string().optional(),

  paid: z.number().optional(),
  amount: z.number(),

  payees: z.array(z.object(PAY_SCHEMA)),
  payers: z.array(z.object(PAY_SCHEMA)).optional(),

  currency: z.string().optional(),
  items: z.array(z.object(ITEM_SCHEMA)).optional(),

  state: z.nativeEnum(State).optional(),

  profit: z.number().optional(),
  discount: z.number().optional(),

  closed_at: z.string().optional(),
  expires_at: z.string().optional(),

  replication: z.number().optional(),
  subscription: z.string().optional(),
};

const INVOICE_INPUT_SCHEMA: Partial<InvoiceSchema> = { ...INVOICE_SCHEMA, ...CORE_INPUT_SCHEMA };
const INVOICE_OUTPUT_SCHEMA: Partial<InvoiceSchema> = { ...INVOICE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count FinancialInvoice

mcp.server.registerTool(
  'count_financial_invoices',
  {
    title: 'Count FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_financial_invoices', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.financial.invoices.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create FinancialInvoice

mcp.server.registerTool(
  'create_financial_invoices',
  {
    title: 'Create FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: INVOICE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: INVOICE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_financial_invoices', requestInfo, args);

      const payload = args.body as CreateInvoiceDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.invoices.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Invoice with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk FinancialInvoice

mcp.server.registerTool(
  'create-bulk_financial_invoices',
  {
    title: 'Create Bulk FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(INVOICE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(INVOICE_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_financial_invoices', requestInfo, args);

      const payload = args.body as { items: CreateInvoiceDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.financial.invoices.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find FinancialInvoice

mcp.server.registerTool(
  'find_financial_invoices',
  {
    title: 'Find FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(INVOICE_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_financial_invoices', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.financial.invoices.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One FinancialInvoice

mcp.server.registerTool(
  'find-one_financial_invoices',
  {
    title: 'Find One FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: INVOICE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_financial_invoices', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.invoices.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Invoice found successfully.` : `Invoice not found.` }],
      };
    }),
);

// Delete One FinancialInvoice

mcp.server.registerTool(
  'delete-one_financial_invoices',
  {
    title: 'Delete One FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: INVOICE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_financial_invoices', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.invoices.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Invoice deleted (soft) successfully.` }],
      };
    }),
);

// Restore One FinancialInvoice

mcp.server.registerTool(
  'restore-one_financial_invoices',
  {
    title: 'Restore One FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: INVOICE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_financial_invoices', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.invoices.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Invoice restored successfully.` }],
      };
    }),
);

// Destroy One FinancialInvoice

mcp.server.registerTool(
  'destroy-one_financial_invoices',
  {
    title: 'Destroy One FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: INVOICE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_financial_invoices', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.invoices.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Invoice destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk FinancialInvoice

mcp.server.registerTool(
  'update-bulk_financial_invoices',
  {
    title: 'Update Bulk FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: INVOICE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_financial_invoices', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateInvoiceDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.financial.invoices.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One FinancialInvoice

mcp.server.registerTool(
  'update-one_financial_invoices',
  {
    title: 'Update One FinancialInvoice',
    description: `Read "docs://service/financial-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: INVOICE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: INVOICE_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_financial_invoices', requestInfo, args);

      const payload = args.body as UpdateInvoiceDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.financial.invoices.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Invoice updated successfully.` }],
      };
    }),
);
