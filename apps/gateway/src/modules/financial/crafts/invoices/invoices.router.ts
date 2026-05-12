import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, PAY_SCHEMA } from '@app/common/core/mcp';
import { Invoice, InvoiceItem } from '@app/common/interfaces/financial';
import { InvoiceType } from '@app/common/enums/financial';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

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

registerCollectionTools({
  service: 'financial',
  collection: 'invoices',
  entityName: 'FinancialInvoice',
  inputSchema: INVOICE_INPUT_SCHEMA,
  outputSchema: INVOICE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/financial-specification',
  getRestfulService: (platform) => platform.financial.invoices,
});
