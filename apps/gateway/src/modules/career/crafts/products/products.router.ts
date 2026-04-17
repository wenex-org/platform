import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import {
  DEFAULT_LENGTH,
  MAX_LEARNING_RATE,
  MAX_RATING_VALUE,
  MIN_LEARNING_RATE,
  MIN_RATING_VALUE,
} from '@app/common/core/constants';
import { isCategory } from '@app/common/core/decorators/validation';
import { ProductFeatureType } from '@app/common/enums/career';
import { fixOut } from '@app/common/core/utils/mongo';
import { State } from '@app/common/core/enums';
import { isMongoId } from 'class-validator';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const PRODUCT_FEATURE_INPUT_SCHEMA = z.object({
  type: z
    .nativeEnum(ProductFeatureType)
    .describe(
      'REQUIRED. Feature type. Must be one of: TEXT, RANGE, ORDINAL, DISCRETE, CATEGORICAL. If not provided, you MUST ask the user.',
    ),
  title: z.string().trim().min(1).describe('REQUIRED. Title or label of the product feature.'),
  value: z
    .union([z.string(), z.number(), z.boolean()])
    .describe('REQUIRED. The value of the feature. Can be a string, number, or boolean.'),
});

const PRODUCT_INPUT_SCHEMA_FIELDS = {
  name: z
    .string()
    .trim()
    .min(1, 'name is required')
    .describe(
      `REQUIRED. Name of the product. You MUST ask the user for this.
      DO NOT call this tool without a real name provided by the user.`,
    ),
  alias: z.string().trim().optional().describe('OPTIONAL. An alternative name or alias for the product.'),
  state: z
    .nativeEnum(State)
    .optional()
    .describe('OPTIONAL. Lifecycle state of the product (e.g., PENDING, APPROVED). Leave empty to use the default.'),
  store: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid store id' })
    .optional()
    .describe('OPTIONAL. Store id (mongo id) this product belongs to.'),
  branch: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid branch id' })
    .optional()
    .describe('OPTIONAL. Branch id (mongo id) this product is associated with.'),
  business: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid business id' })
    .optional()
    .describe('OPTIONAL. Business id (mongo id) this product belongs to.'),
  brand: z.string().trim().optional().describe('OPTIONAL. Brand name for the product.'),
  content: z.string().trim().optional().describe('OPTIONAL. Detailed description or content of the product.'),
  cover: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid cover id' })
    .optional()
    .describe('OPTIONAL. MongoDB ObjectId referencing the product cover image asset.'),
  gallery: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid gallery image id' }),
    )
    .max(DEFAULT_LENGTH)
    .optional()
    .describe('OPTIONAL. Array of MongoDB ObjectIds referencing the product gallery images.'),
  categories: z
    .array(
      z.string().refine((val) => isCategory(val), {
        message: 'Invalid category.',
      }),
    )
    .max(DEFAULT_LENGTH)
    .optional()
    .describe('OPTIONAL. Categories the product belongs to.'),
  rate: z.number().min(MIN_LEARNING_RATE).max(MAX_LEARNING_RATE).optional().describe('OPTIONAL. Learning rate of the product.'),
  votes: z.number().int().min(0).optional().describe('OPTIONAL. Number of votes for the product.'),
  rating: z
    .number()
    .min(MIN_RATING_VALUE)
    .max(MAX_RATING_VALUE)
    .optional()
    .describe('OPTIONAL. Aggregate rating value of the product.'),
  features: z
    .array(PRODUCT_FEATURE_INPUT_SCHEMA)
    .optional()
    .describe(
      'OPTIONAL. List of product features, each with a type (TEXT, RANGE, ORDINAL, DISCRETE, CATEGORICAL), title, and value.',
    ),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------

const PRODUCT_FEATURE_OUTPUT_SCHEMA = z.object({
  type: z.string().optional().describe('Feature type.'),
  title: z.string().optional().describe('Title or label of the feature.'),
  value: z.union([z.string(), z.number(), z.boolean()]).optional().describe('The value of the feature.'),
});

const PRODUCT_OUTPUT_SCHEMA_FIELDS = {
  name: z.string().optional().describe('The name of the product.'),
  alias: z.string().optional().describe('An alternative name or alias for the product.'),
  state: z.string().optional().describe('Lifecycle state of the product.'),
  store: z.string().optional().describe('MongoDB ObjectId referencing the product store.'),
  branch: z.string().optional().describe('MongoDB ObjectId referencing the associated branch.'),
  business: z.string().optional().describe('MongoDB ObjectId referencing the associated business.'),
  brand: z.string().optional().describe('Brand name of the product.'),
  content: z.string().optional().describe('Detailed description or content of the product.'),
  cover: z.string().optional().describe('MongoDB ObjectId referencing the product cover image.'),
  gallery: z.array(z.string()).optional().describe('Array of MongoDB ObjectIds referencing gallery images.'),
  categories: z.array(z.string()).optional().describe('List of category identifiers the product belongs to.'),
  rate: z.number().optional().describe('Learning rate of the product.'),
  votes: z.number().optional().describe('Number of votes received.'),
  rating: z.number().optional().describe('Aggregate rating value of the product.'),
  features: z.array(PRODUCT_FEATURE_OUTPUT_SCHEMA).optional().describe('List of product features.'),
};

// ------------------------------------------------------------------------------------------------
// Shared Data Dictionary
// ------------------------------------------------------------------------------------------------

const PRODUCT_DATA_DICTIONARY = `
  name: REQUIRED. The human-readable name of the product.
  alias: OPTIONAL. An alternative name or alias for the product.
  state: OPTIONAL. Lifecycle state of the product. Must be one of ${Object.values(State).join(', ')}.
  store: OPTIONAL. MongoDB ObjectId referencing the store this product belongs to.
  branch: OPTIONAL. MongoDB ObjectId referencing the associated branch.
  business: OPTIONAL. MongoDB ObjectId referencing the associated business.
  brand: OPTIONAL. Brand name of the product.
  content: OPTIONAL. Detailed description or content body of the product.
  cover: OPTIONAL. MongoDB ObjectId referencing the cover image asset.
  gallery: OPTIONAL. Array of MongoDB ObjectIds referencing gallery image assets.
  categories: OPTIONAL. List of category identifiers the product belongs to.
  rate: OPTIONAL. Learning rate of the product. Must be a number between ${MIN_LEARNING_RATE} and ${MAX_LEARNING_RATE}.
  votes: OPTIONAL. Number of votes received. Must be a non-negative integer.
  rating: OPTIONAL. Aggregate rating value. Must be a number between ${MIN_RATING_VALUE} and ${MAX_RATING_VALUE}.
  features: OPTIONAL. List of product features. Each feature has: type (TEXT | RANGE | ORDINAL | DISCRETE | CATEGORICAL), title (string), value (string | number | boolean).
`.trim();

// ------------------------------------------------------------------------------------------------
// Search Schemas (Abstract Syntax Tree (AST) / Query Builder for LLM)
// ------------------------------------------------------------------------------------------------

const FIELD_OPERATOR = z.enum([
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'nin',
  'regex',
  'exists',
  'near',
  'nearSphere',
  'geoWithin',
  'geoIntersects',
]);

const LOGICAL_OPERATOR = z.enum(['and', 'or']);
const ALLOWED_POPULATES = z.enum(['owner', 'shares', 'clients', 'groups']);

export type AstNode =
  | { logical: z.infer<typeof LOGICAL_OPERATOR>; conditions: AstNode[] }
  | { field: string; operator: z.infer<typeof FIELD_OPERATOR>; value: any };

const AST_NODE_SCHEMA: z.ZodType<AstNode> = z.lazy(() =>
  z.union([
    z.object({
      logical: LOGICAL_OPERATOR.describe("REQUIRED for grouping. Use 'and' or 'or'."),
      conditions: z.array(AST_NODE_SCHEMA).min(1).describe('REQUIRED. Array of nested conditions.'),
    }),
    z.object({
      field: z
        .string()
        .trim()
        .describe(
          `REQUIRED. Exact DB field name.
          MAPPINGS (Product fields):
            "product name/title/label" -> name |
            "product alias/alternate name" -> alias |
            "approval state/lifecycle" -> state |
            "store/shop" -> store |
            "branch/location branch" -> branch |
            "company/business/organization" -> business |
            "brand/manufacturer" -> brand |
            "description/content/body" -> content |
            "cover/thumbnail/main image" -> cover |
            "gallery/images" -> gallery |
            "category/categories" -> categories |
            "learning rate/rate" -> rate |
            "number of votes/votes" -> votes |
            "score/rating" -> rating |
            "feature type" -> features.type |
            "feature title/feature label" -> features.title |
            "feature value" -> features.value.
          MAPPINGS (Core fields): "owner/creator" -> owner | "shared with" -> shares | "group" -> groups | "client" -> clients | "tag/label" -> tags | "ref/external id" -> ref.
          Support dot-notation for nested fields. DO NOT invent fields.`,
        ),
      operator: FIELD_OPERATOR.describe(
        `REQUIRED. Comparison or geospatial operator.
        [CRITICAL RULE FOR 'regex']: If the user asks for a "contains", "like", or "search" operation, you MUST use the 'regex' operator and pass ONLY the raw exact string in 'value'.
        DO NOT manually add '.*', '^', or '$' wildcards.`,
      ),
      value: z
        .union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.any())])
        .describe('REQUIRED. The value to match.'),
    }),
  ]),
);

const ROOT_QUERY_SCHEMA = z.object({
  logical: z.literal('and').default('and').describe("The root must always be an 'and' operator."),
  conditions: z.array(AST_NODE_SCHEMA).default([]).describe(`OPTIONAL. The nested AST conditions.
    Example for "state is PENDING OR store is <id>":
    {
      "logical": "and",
      "conditions": [
        {
          "logical": "or",
          "conditions": [
            { "field": "state", "operator": "eq", "value": "PENDING" },
            { "field": "store", "operator": "eq", "value": "<mongo_id>" }
          ]
        }
      ]
    }`),
});

// Recursively builds a MongoDB query object from the AST node
function buildMongoQuery(node: AstNode): Record<string, any> {
  if ('logical' in node) {
    if (!node.conditions?.length) return {};
    const mappedConditions = node.conditions.map((child) => buildMongoQuery(child));
    return { [`$${node.logical}`]: mappedConditions };
  }

  const { field, operator, value } = node;

  switch (operator) {
    case 'eq':
      return { [field]: value };

    case 'regex': {
      let regexStr = String(value);
      // Clean up LLM hallucinations: Remove leading and trailing '.*' if they exist
      if (regexStr.startsWith('.*') && regexStr.endsWith('.*')) {
        regexStr = regexStr.slice(2, -2);
      }
      return { [field]: { $regex: regexStr, $options: 'i' } };
    }

    case 'exists':
      return { [field]: { $exists: Boolean(value) } };

    case 'near':
    case 'nearSphere':
    case 'geoWithin':
    case 'geoIntersects':
      return { [field]: { [`$${operator}`]: value } };

    default:
      return { [field]: { [`$${operator}`]: value } };
  }
}

// ------------------------------------------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------
// Search & Get Count Career Products
// ------------------------------------------------
mcp.server.registerTool(
  'count_career_product',
  {
    title: 'Get Count Career Product',
    description:
      `[ACTION] Calculates and returns the EXACT total number of Career Products matching criteria without fetching documents.
      [TRIGGER] Use ONLY when the user explicitly asks for "how many", "count", "number of", or "total" products.
      [RULES]
      1. PERFORMANCE: Never use 'find_career_product' to count items. Always use this tool to save network bandwidth.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Query tree. Leave empty to count all products.'),
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of products matching the conditions.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('count_career_product');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type CountPayload = Parameters<typeof mcp.platform.career.products.count>[0];
      const payload: CountPayload = { query: mongoQuery } as CountPayload;

      const totalCount = await mcp.platform.career.products.count(payload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `There are exactly ${safeData.count} products matching your criteria.` }],
      };
    }),
);

// ------------------------------------------------
// Create Career Product
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_product',
  {
    title: 'Create Career Product',
    description: `[ACTION] Creates a single new Career Product.
      [TRIGGER] Use when the user explicitly asks to create or add a new product.
      [RULES]
      1. ACCURACY: Ensure all REQUIRED fields (name) are present or ask the user before calling this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: { ...PRODUCT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: {
      ...PRODUCT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_product');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create product...');

      // Ensure payload matches platform SDK type
      type CreatePayload = Parameters<typeof mcp.platform.career.products.create>[0];
      const payload = data as CreatePayload;

      const product = await mcp.platform.career.products.create(payload, { headers });
      const fixedProduct = fixOut(product);

      const schema = z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedProduct);

      logger('A new product created with ID: %s', safeData.id);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Product "${safeData.name || safeData.id}" created successfully.` }],
      };
    }),
);

// ------------------------------------------------
// Creates Multiple Career Products in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_product_bulk',
  {
    title: 'Create Multiple Career Products (Bulk)',
    description: `[ACTION] Creates multiple Career Products in a single request (Bulk operation).
      [TRIGGER] Use when the user needs to create multiple products at once.
      [RULES]
      1. PERFORMANCE: Prefer this tool over calling 'create_career_product' multiple times in a loop.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      items: z
        .array(z.object({ ...PRODUCT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
        .min(1)
        .describe('REQUIRED. An array containing the products to be created.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('List of the created products.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_product_bulk');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create bulk products...');

      // Ensure payload matches platform SDK type
      type CreateBulkPayload = Parameters<typeof mcp.platform.career.products.createBulk>[0];
      const bulkPayload = data as CreateBulkPayload;

      const products = await mcp.platform.career.products.createBulk(bulkPayload, { headers });
      const fixedProducts = fixOut(products);

      const schemaArray = z.array(z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(fixedProducts);

      logger('%d products created in bulk', safeDataArray.length);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `${safeDataArray.length} Products created successfully in bulk.` }],
      };
    }),
);

// ------------------------------------------------
// Search & Get Career Products
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_product',
  {
    title: 'Find Career Product',
    description: `[ACTION] Fetches Career Products using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or find products based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_career_product' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Nested AST query tree for advanced filtering.'),
      projection: z.array(z.string().trim()).optional().describe('OPTIONAL. Controls output fields.'),
      populate: z.array(ALLOWED_POPULATES).optional().describe('OPTIONAL. Relations to join.'),
      pagination: z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
        })
        .optional()
        .describe('OPTIONAL. Pagination config. Default is page 1, limit 20.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('The list of matching products.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_product');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type FindFilterPayload = Parameters<typeof mcp.platform.career.products.find>[0];
      const filterPayload: FindFilterPayload = {
        query: mongoQuery,
        projection: data.projection as FindFilterPayload['projection'],
        populate: data.populate as FindFilterPayload['populate'],
        pagination: data.pagination as FindFilterPayload['pagination'],
      };

      const productsArray = await mcp.platform.career.products.find(filterPayload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %j', productsArray);

      const schemaArray = z.array(z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(productsArray);

      logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} products.` }],
      };
    }),
);

// ------------------------------------------------
// Find Career Product By Id
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_product_by_id',
  {
    title: 'Find Career Product By Id',
    description:
      `[ACTION] Retrieves the complete, detailed record of a specific Career Product using its exact MongoDB ObjectId or external reference (ref).
      [TRIGGER] Use when the user provides an exact ID or asks for full details of a specific product identified in a previous step.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If searching by name or category, use 'find_career_product' first to extract the correct ID, THEN call this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId to find. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...PRODUCT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_product_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type FindByIdConfig = Parameters<typeof mcp.platform.career.products.findById>[1];
      const config: FindByIdConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const product = await mcp.platform.career.products.findById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', product);

      const fixedProduct = fixOut(product);

      const schema = z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedProduct);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Product with ID "${data.id}" was successfully found.` }],
      };
    }),
);

// ------------------------------------------------
// Delete Career Product By Id
// ------------------------------------------------
mcp.server.registerTool(
  'delete_career_product_by_id',
  {
    title: 'Delete Career Product By Id',
    description: `[ACTION] Soft-deletes a Career Product by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to remove or delete a specific product.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Delete the winter jacket product"), you MUST use 'find_career_product' first to retrieve the correct exact ID.
      [WARNING] DESTRUCTIVE ACTION: Make sure you have the correct ID before executing.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the product. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...PRODUCT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('delete_career_product_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type DeleteConfig = Parameters<typeof mcp.platform.career.products.deleteById>[1];
      const config: DeleteConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const deletedProduct = await mcp.platform.career.products.deleteById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', deletedProduct);

      const fixedDeletedProduct = fixOut(deletedProduct);

      const schema = z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDeletedProduct);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Product with ID "${safeData.id}" (Name: ${safeData.name || 'Unknown'}) was deleted.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Restore Career Product By Id
// ------------------------------------------------
mcp.server.registerTool(
  'restore_career_product_by_id',
  {
    title: 'Restore Career Product By Id',
    description: `[ACTION] Restores (un-deletes) a previously soft-deleted Career Product by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to restore, recover, reactivate, or undelete a specific product.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Restore the deleted winter jacket"), you MUST use 'find_career_product'
      (with appropriate filters for deleted items) first to retrieve the correct exact ID.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the product. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...PRODUCT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('restore_career_product_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type RestoreConfig = Parameters<typeof mcp.platform.career.products.restoreById>[1];
      const config: RestoreConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const restoredProduct = await mcp.platform.career.products.restoreById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', restoredProduct);

      const fixedRestoredProduct = fixOut(restoredProduct);

      const schema = z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedRestoredProduct);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Product with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was restored.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Destroy Career Product By Id
// ------------------------------------------------
mcp.server.registerTool(
  'destroy_career_product_by_id',
  {
    title: 'Destroy Career Product By Id',
    description: `[ACTION] Permanently destroys (hard-deletes) a Career Product by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to "permanently delete", "destroy", "purge", or "completely remove" a product.
      [RULES]
      1. CONFIRMATION REQUIRED: NEVER execute this tool immediately. First, explain to the user that this action is IRREVERSIBLE,
          show them the Product ID/Name, and ask for their explicit confirmation (e.g., "Are you absolutely sure?").
          ONLY call this tool AFTER the user replies "yes".
      2. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      3. CHAINING: If the exact ID is unknown, MUST use 'find_career_product' first to retrieve it.
      [WARNING] IRREVERSIBLE ACTION: This permanently removes the record from the database. It CANNOT be restored.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the product. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
      verification_code: z
        .string()
        .trim()
        .optional()
        .describe(
          `CRITICAL: MUST be exactly 'CONFIRM_DESTROY'.
          If the user's prompt DOES NOT contain the exact phrase 'CONFIRM_DESTROY', you MUST leave this field empty. Do NOT auto-fill or guess this.`,
        ),
    },
    outputSchema: {
      ...PRODUCT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('destroy_career_product_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      if (data.verification_code !== 'CONFIRM_DESTROY') {
        logger('=== BLOCKED: Waiting for User Confirmation ===');

        const blockedPayload = {
          status: 'BLOCKED_AWAITING_CONFIRMATION' as const,
          message: 'Security Gate: User confirmation required.',
        };

        return {
          structuredContent: blockedPayload,
          content: [
            {
              type: 'text',
              text: ` SYSTEM SECURITY GATE: Execution BLOCKED.
                    You MUST STOP and ask the user this exact question right now:
                    "WARNING: You are about to PERMANENTLY destroy this product.
                    This action cannot be undone and the data will be lost forever.
                    To proceed, please reply with the exact phrase: CONFIRM_DESTROY"`,
            },
          ],
        };
      }

      logger('=== UNLOCKED: Executing Destruction ===');
      type DestroyConfig = Parameters<typeof mcp.platform.career.products.destroyById>[1];
      const config: DestroyConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const destroyedProduct = await mcp.platform.career.products.destroyById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', destroyedProduct);

      const fixedDestroyedProduct = fixOut(destroyedProduct);

      const schema = z.object({ ...PRODUCT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDestroyedProduct);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Product with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was destroyed.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Update Multiple Career Products in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_product_bulk',
  {
    title: 'Update Multiple Career Products (Bulk)',
    description: `[ACTION] Updates multiple Career Products matching a query in a single request.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, or change multiple products at once based on a filter.
      [RULES]
      1. NO HALLUCINATION: Build the AST query accurately from the user's intent.
      2. PARTIAL UPDATE: Only include the fields that actually need to be changed in the update payload.
      3. CONFIRMATION: If the query is broad (e.g., no conditions), warn the user before proceeding — this can affect many records.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe(
        'OPTIONAL. Query tree to select which products to update. Leave empty to match all accessible.',
      ),
      // Merge Product + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...PRODUCT_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of products that were updated.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_product_bulk');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      const { ast_query, ...updatePayload } = data;
      const mongoQuery = ast_query?.conditions?.length ? buildMongoQuery(ast_query as AstNode) : {};

      // Extract exact SDK type to enforce compile-time safety
      type UpdateBulkPayload = Parameters<typeof mcp.platform.career.products.updateBulk>[0];
      type UpdateBulkData = Parameters<typeof mcp.platform.career.products.updateBulk>[1];

      const filterPayload: UpdateBulkPayload = { query: mongoQuery } as UpdateBulkPayload;
      const safePayload = updatePayload as UpdateBulkData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const totalCount = await mcp.platform.career.products.updateBulk(filterPayload, safePayload, { headers });

      logger('=== 3. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `${safeData.count} product(s) were successfully updated.` }],
      };
    }),
);

// ------------------------------------------------
// Update Single Career Product By Id
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_product_by_id',
  {
    title: 'Update Career Product By Id',
    description: `[ACTION] Updates (patches) an existing Career Product by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, edit, or change an existing product.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Update the winter jacket"), you MUST use 'find_career_product' first to retrieve it.
      3. PARTIAL UPDATE: Only provide the fields that actually need to be changed. Leave other fields empty.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${PRODUCT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the product to update. Do not guess.'),
      // Merge Product + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...PRODUCT_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      ...PRODUCT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_product_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      // Separate 'id' and 'ref' from the actual update payload
      const { id, ref, ...updatePayload } = data;

      // Extract exact SDK type for config to enforce compile-time safety
      type UpdateByIdConfig = Parameters<typeof mcp.platform.career.products.updateById>[2];
      const config: UpdateByIdConfig = {
        headers,
        ...(ref && { params: { ref } }),
      };

      // Using 'as' here is safe because Zod has already validated the shape of the payload
      type UpdateByIdData = Parameters<typeof mcp.platform.career.products.updateById>[1];
      const safePayload = updatePayload as UpdateByIdData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const updatedProduct = await mcp.platform.career.products.updateById(id, safePayload, config);

      logger('=== 3. RAW DB OUTPUT === : %j', updatedProduct);

      const fixedUpdatedProduct = fixOut(updatedProduct);
      const schema = z.object({
        ...PRODUCT_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
      });
      const safeData = schema.parse(fixedUpdatedProduct);

      logger('=== 4. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Product with ID "${id}" was successfully updated.`,
          },
        ],
      };
    }),
);
