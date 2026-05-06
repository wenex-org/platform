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
import { CreateProductDto, UpdateProductDto } from '@app/common/dto/career';
import { Product, ProductFeature } from '@app/common/interfaces/career';
import { ProductFeatureType } from '@app/common/enums/career';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ProductFeatureSchema = Record<keyof ProductFeature, ZodType>;

const FEATURE_SCHEMA: Partial<ProductFeatureSchema> = {
  type: z.nativeEnum(ProductFeatureType),

  title: z.string(),
  value: z.union([z.boolean(), z.number(), z.string()]),

  ...CORE_INPUT_SCHEMA,
};

type ProductSchema = Record<keyof Product, ZodType>;

const PRODUCT_SCHEMA: Partial<ProductSchema> = {
  name: z.string(),
  alias: z.string().optional(),

  state: z.nativeEnum(State),

  store: z.string().optional(),
  branch: z.string().optional(),
  business: z.string().optional(),

  brand: z.string().optional(),
  content: z.string().optional(),

  cover: z.string().optional(),
  gallery: z.array(z.string()),
  categories: z.array(z.string()),

  rate: z.number(),
  votes: z.number(),
  rating: z.number(),

  features: z.array(z.object(FEATURE_SCHEMA)).optional(),
};

const PRODUCT_INPUT_SCHEMA: Partial<ProductSchema> = { ...PRODUCT_SCHEMA, ...CORE_INPUT_SCHEMA };
const PRODUCT_OUTPUT_SCHEMA: Partial<ProductSchema> = { ...PRODUCT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count CareerProduct

mcp.server.registerTool(
  'count_career_products',
  {
    title: 'Count CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_career_products', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.career.products.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create CareerProduct

mcp.server.registerTool(
  'create_career_products',
  {
    title: 'Create CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: PRODUCT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: PRODUCT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_career_products', requestInfo, args);

      const payload = args.body as CreateProductDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.products.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Product with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk CareerProduct

mcp.server.registerTool(
  'create-bulk_career_products',
  {
    title: 'Create Bulk CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(PRODUCT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(PRODUCT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_career_products', requestInfo, args);

      const payload = args.body as { items: CreateProductDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.products.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find CareerProduct

mcp.server.registerTool(
  'find_career_products',
  {
    title: 'Find CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(PRODUCT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_career_products', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.career.products.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from products.` }],
      };
    }),
);

// Find One CareerProduct

mcp.server.registerTool(
  'find-one_career_products',
  {
    title: 'Find One CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PRODUCT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_career_products', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.products.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Product found successfully.` : `Product not found.` }],
      };
    }),
);

// Delete One CareerProduct

mcp.server.registerTool(
  'delete-one_career_products',
  {
    title: 'Delete One CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PRODUCT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_career_products', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.products.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Product deleted (soft) successfully.` }],
      };
    }),
);

// Restore One CareerProduct

mcp.server.registerTool(
  'restore-one_career_products',
  {
    title: 'Restore One CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PRODUCT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_career_products', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.products.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Product restored successfully.` }],
      };
    }),
);

// Destroy One CareerProduct

mcp.server.registerTool(
  'destroy-one_career_products',
  {
    title: 'Destroy One CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PRODUCT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_career_products', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.products.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Product destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk CareerProduct

mcp.server.registerTool(
  'update-bulk_career_products',
  {
    title: 'Update Bulk CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: PRODUCT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_career_products', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateProductDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.career.products.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One CareerProduct

mcp.server.registerTool(
  'update-one_career_products',
  {
    title: 'Update One CareerProduct',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: PRODUCT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: PRODUCT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_career_products', requestInfo, args);

      const payload = args.body as UpdateProductDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.products.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Product updated successfully.` }],
      };
    }),
);
