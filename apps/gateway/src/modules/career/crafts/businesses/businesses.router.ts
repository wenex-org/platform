import {
  DEFAULT_LENGTH,
  MAX_LEARNING_RATE,
  MAX_RATING_VALUE,
  MIN_LEARNING_RATE,
  MIN_RATING_VALUE,
} from '@app/common/core/constants';
import { isCategory } from '@app/common/core/decorators/validation';
import { State, Status } from '@app/common/core/enums';
import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { BusinessType } from '@app/common/enums/career';
import { isDate, isMongoId, isURL } from 'class-validator';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------
const BUSINESS_INPUT_SCHEMA_FIELDS = {
  name: z.string().trim().min(1, 'name is required').describe(`REQUIRED. Name for the business. You MUST ask the user for this.
      DO NOT call this tool without a real name provided by the user.`),
  type: z
    .nativeEnum(BusinessType)
    .describe('REQUIRED. Type of the business. If not provided, DO NOT call this tool, you MUST ask the user.'),
  code: z.string().trim().optional().describe('OPTIONAL. A short code identifier for the business.'),
  alias: z.string().trim().optional().describe('OPTIONAL. An alternative name or alias for the business.'),
  logo: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), {
      message: 'Invalid MongoDB ObjectId string.',
    })
    .optional()
    .describe('An optional MongoDB ObjectId string referencing the business logo.'),
  cover: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), {
      message: 'Invalid MongoDB ObjectId string.',
    })
    .optional()
    .describe('An optional MongoDB ObjectId string referencing the business cover image.'),
  slogan: z.string().trim().optional().describe('An optional slogan for the business.'),
  state: z
    .nativeEnum(State)
    .optional()
    .describe(`OPTIONAL. Lifecycle state of the business (e.g., PENDING, APPROVED). Leave empty to use the default.`),
  status: z
    .nativeEnum(Status)
    .describe(
      'REQUIRED. Operational status of the business (e.g., ACTIVE, INACTIVE). If not provided, DO NOT call this tool, you MUST ask the user.',
    ),
  rate: z.number().min(MIN_LEARNING_RATE).max(MAX_LEARNING_RATE).optional().describe('OPTIONAL. Learning rate of the branch.'),
  votes: z.number().int().min(0).optional().describe('OPTIONAL. Number of votes.'),
  rating: z.number().min(MIN_RATING_VALUE).max(MAX_RATING_VALUE).optional().describe('OPTIONAL. Rating value of the branch.'),
  address: z.string().trim().optional().describe('OPTIONAL. Address.'),
  support: z.string().trim().optional().describe('OPTIONAL. Support contact information.'),
  website: z
    .string()
    .trim()
    .refine((val) => isURL(val), {
      message: 'Invalid URL.',
    })
    .optional()
    .describe('OPTIONAL. Website URL.'),
  location: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), {
      message: 'Invalid MongoDB ObjectId string.',
    })
    .optional()
    .describe('OPTIONAL. Location.'),
  categories: z
    .array(
      z.string().refine((val) => isCategory(val), {
        message: 'Invalid category.',
      }),
    )
    .max(DEFAULT_LENGTH)
    .optional()
    .describe('OPTIONAL. Categories.'),
  founder: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), {
      message: 'Invalid MongoDB ObjectId string.',
    })
    .optional()
    .describe('OPTIONAL. MongoDB ObjectId of the business founder.'),
  co_founders: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), {
          message: 'Invalid MongoDB ObjectId string.',
        }),
    )
    .optional()
    .describe('OPTIONAL. Array of MongoDB ObjectIds for co-founders of the business.'),
  partners: z
    .array(
      z.string().refine((val) => isMongoId(val), {
        message: 'Invalid MongoDB ObjectId string.',
      }),
    )
    .optional()
    .describe('OPTIONAL. Partners of the business.'),
  investors: z
    .array(
      z.string().refine((val) => isMongoId(val), {
        message: 'Invalid MongoDB ObjectId string.',
      }),
    )
    .optional()
    .describe('OPTIONAL. Investors of the business.'),
  suppliers: z
    .array(
      z.string().refine((val) => isMongoId(val), {
        message: 'Invalid MongoDB ObjectId string.',
      }),
    )
    .optional()
    .describe('OPTIONAL. Suppliers of the business.'),
  customers: z
    .array(
      z.string().refine((val) => isMongoId(val), {
        message: 'Invalid MongoDB ObjectId string.',
      }),
    )
    .optional()
    .describe('OPTIONAL. Customers of the business.'),
  foundation_date: z
    .string()
    .trim()
    .refine((val) => isDate(val), { message: 'Invalid date' })
    .optional()
    .describe('OPTIONAL. Opening date in ISO format.'),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------
const BUSINESS_OUTPUT_SCHEMA_FIELDS = {
  name: z.string().optional().describe('The name of the business.'),
  type: z.string().optional().describe('The type of the business.'),
  code: z.string().optional().describe('A short code identifier for the business.'),
  alias: z.string().optional().describe('An alternative name or alias for the business.'),
  logo: z.string().optional().describe('MongoDB ObjectId referencing the business logo asset.'),
  cover: z.string().optional().describe('MongoDB ObjectId referencing the business cover image asset.'),
  slogan: z.string().optional().describe('A tagline or slogan for the business.'),
  state: z.string().optional().describe('Lifecycle state of the business.'),
  status: z.string().optional().describe('Operational status of the business.'),
  rate: z.number().optional().describe('Learning rate of the business.'),
  votes: z.number().optional().describe('Number of votes received.'),
  rating: z.number().optional().describe('Aggregate rating value of the business.'),
  address: z.string().optional().describe('Physical address of the business.'),
  support: z.string().optional().describe('Support contact information.'),
  website: z.string().optional().describe('Official website URL.'),
  location: z.string().optional().describe('MongoDB ObjectId referencing the business location.'),
  categories: z.array(z.string()).optional().describe('List of category identifiers.'),
  founder: z.string().optional().describe('MongoDB ObjectId of the business founder.'),
  co_founders: z.array(z.string()).optional().describe('Array of MongoDB ObjectIds for co-founders.'),
  partners: z.array(z.string()).optional().describe('Array of MongoDB ObjectIds for business partners.'),
  investors: z.array(z.string()).optional().describe('Array of MongoDB ObjectIds for investors.'),
  suppliers: z.array(z.string()).optional().describe('Array of MongoDB ObjectIds for suppliers.'),
  customers: z.array(z.string()).optional().describe('Array of MongoDB ObjectIds for customers.'),
  foundation_date: z.any().optional().describe('Date the business was founded.'),
};

// ------------------------------------------------------------------------------------------------
// Shared Data Dictionary
// ------------------------------------------------------------------------------------------------

const BUSINESS_DATA_DICTIONARY = `
  name: REQUIRED. The name of the business.
  type: REQUIRED. The type of the business. Must be one of ${Object.values(BusinessType).join(', ')}.
  code: OPTIONAL. A short code identifier for the business.
  alias: OPTIONAL. An alternative name or alias for the business.
  logo: OPTIONAL. MongoDB ObjectId referencing the business logo asset.
  cover: OPTIONAL. MongoDB ObjectId referencing the business cover image asset.
  slogan: OPTIONAL. A tagline or slogan for the business.
  state: OPTIONAL. Lifecycle state of the business. Must be one of ${Object.values(State).join(', ')}.
  status: OPTIONAL. Operational status of the business. Must be one of ${Object.values(Status).join(', ')}.
  rate: OPTIONAL. Learning rate of the business. Must be a number between ${MIN_LEARNING_RATE} and ${MAX_LEARNING_RATE}.
  votes: OPTIONAL. Number of votes received. Must be a non-negative integer.
  rating: OPTIONAL. Aggregate rating value. Must be a number between ${MIN_RATING_VALUE} and ${MAX_RATING_VALUE}.
  address: OPTIONAL. Physical address of the business.
  support: OPTIONAL. Support contact information (e.g., email or phone).
  website: OPTIONAL. Official website URL. Must be a valid URL.
  location: OPTIONAL. MongoDB ObjectId referencing the business location.
  categories: OPTIONAL. List of category identifiers the business belongs to.
  founder: OPTIONAL. MongoDB ObjectId of the business founder.
  co_founders: OPTIONAL. Array of MongoDB ObjectIds for co-founders.
  partners: OPTIONAL. Array of MongoDB ObjectIds for business partners.
  investors: OPTIONAL. Array of MongoDB ObjectIds for investors.
  suppliers: OPTIONAL. Array of MongoDB ObjectIds for suppliers.
  customers: OPTIONAL. Array of MongoDB ObjectIds for customers.
  foundation_date: OPTIONAL. Date the business was founded, in ISO format (YYYY-MM-DD).
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
          MAPPINGS (Business fields):
            "company/organization/firm/brand" -> name |
            "kind/variant/category" -> type |
            "short code/abbreviation" -> code |
            "alternative name" -> alias |
            "logo/icon" -> logo |
            "cover/banner" -> cover |
            "tagline/motto" -> slogan |
            "approval/lifecycle state" -> state |
            "active/inactive" -> status |
            "learning rate" -> rate |
            "number of votes" -> votes |
            "score/rating" -> rating |
            "physical address" -> address |
            "support/contact info" -> support |
            "website/url" -> website |
            "location/place" -> location |
            "categories/sectors" -> categories |
            "creator/establisher" -> founder |
            "co-founders" -> co_founders |
            "business partners" -> partners |
            "investors/funders" -> investors |
            "suppliers/vendors" -> suppliers |
            "customers/clients" -> customers |
            "established/founded/inception" -> foundation_date.
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
    Example for "name is X OR type is CORPORATE":
    {
      "logical": "and",
      "conditions": [
        {
          "logical": "or",
          "conditions": [
            { "field": "name", "operator": "eq", "value": "X" },
            { "field": "type", "operator": "eq", "value": "CORPORATE" }
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
      // ASK[VAHID]: CAN WE USE $options?
      /*
      - Add $options: 'i' to make the search case-insensitive
      - BUT PLATFORM NOT SUPPORT $options
      - return { [field]: { $regex: regexStr, $options: 'i' } };
      */
      return { [field]: { $regex: regexStr } };
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
// Search & Get Count Career Businesses
// ------------------------------------------------
mcp.server.registerTool(
  'count_career_business',
  {
    title: 'Get Count Career Business',
    description:
      `[ACTION] Calculates and returns the EXACT total number of Career Businesses matching criteria without fetching documents.
      [TRIGGER] Use ONLY when the user explicitly asks for "how many", "count", "number of", or "total" businesses.
      [RULES]
      1. PERFORMANCE: Never use 'find_career_business' to count items. Always use this tool to save network bandwidth.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Query tree. Leave empty to count all accessible.'),
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of businesses matching the conditions.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('count_career_business');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type CountPayload = Parameters<typeof mcp.platform.career.businesses.count>[0];
      const payload: CountPayload = { query: mongoQuery } as CountPayload;

      const totalCount = await mcp.platform.career.businesses.count(payload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `There are exactly ${safeData.count} businesses matching your criteria.` }],
      };
    }),
);

// ------------------------------------------------
// Create Career Business
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_business',
  {
    title: 'Create Career Business',
    description: `[ACTION] Creates a single new Career Business.
      [TRIGGER] Use when the user explicitly asks to create or add a new business.
      [RULES]
      1. ACCURACY: Ensure all REQUIRED fields (name, type, status) are present or ask the user before calling this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: { ...BUSINESS_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: {
      ...BUSINESS_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_business');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create business...');

      // Ensure payload matches platform SDK type
      type CreatePayload = Parameters<typeof mcp.platform.career.businesses.create>[0];
      const payload = data as CreatePayload;

      const business = await mcp.platform.career.businesses.create(payload, { headers });
      const fixedBusiness = fixOut(business);

      const schema = z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedBusiness);

      logger('A new business created with ID: %s', safeData.id);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Business "${safeData.name || safeData.id}" created successfully.` }],
      };
    }),
);

// ------------------------------------------------
// Creates Multiple Career Businesses in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_business_bulk',
  {
    title: 'Create Multiple Career Businesses (Bulk)',
    description: `[ACTION] Creates multiple Career Businesses in a single request (Bulk operation).
      [TRIGGER] Use when the user needs to create multiple businesses at once.
      [RULES]
      1. PERFORMANCE: Always prefer this tool over calling 'create_career_business' multiple times in a loop.
      [WARNING] Ensure the items array is correctly formatted and all required fields are present for each item.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      items: z
        .array(z.object({ ...BUSINESS_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
        .min(1)
        .describe('REQUIRED. An array containing the businesses to be created.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('List of the created businesses.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_business_bulk');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create bulk businesses...');

      // Ensure payload matches platform SDK type
      type CreateBulkPayload = Parameters<typeof mcp.platform.career.businesses.createBulk>[0];
      const bulkPayload = data as CreateBulkPayload;

      const businesses = await mcp.platform.career.businesses.createBulk(bulkPayload, { headers });
      const fixedBusinesses = fixOut(businesses);

      const schemaArray = z.array(z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(fixedBusinesses);

      logger('%d businesses created in bulk', safeDataArray.length);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `${safeDataArray.length} Businesses created successfully in bulk.` }],
      };
    }),
);

// ------------------------------------------------
// Search & Get Career Businesses
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_business',
  {
    title: 'Find Career Business',
    description: `[ACTION] Fetches Career Businesses using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or find businesses based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_career_business' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Nested AST query tree for advanced filtering.'),
      projection: z.array(z.string().trim()).optional().describe(`OPTIONAL. Controls output fields.`),
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
        .array(z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('The list of matching businesses.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_business');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type FindFilterPayload = Parameters<typeof mcp.platform.career.businesses.find>[0];
      const filterPayload: FindFilterPayload = {
        query: mongoQuery,
        projection: data.projection as FindFilterPayload['projection'],
        populate: data.populate as FindFilterPayload['populate'],
        pagination: data.pagination as FindFilterPayload['pagination'],
      };

      const businessesArray = await mcp.platform.career.businesses.find(filterPayload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %j', businessesArray);

      const schemaArray = z.array(z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(businessesArray);

      logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} businesses.` }],
      };
    }),
);

// ------------------------------------------------
// Find Career Business By Id
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_business_by_id',
  {
    title: 'Find Career Business By Id',
    description:
      `[ACTION] Retrieves the complete, detailed record of a specific Career Business using its exact MongoDB ObjectId or external reference (ref).
      [TRIGGER] Use when the user provides an exact ID or asks for full details of a specific business identified in a previous step.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If searching by name or type, use 'find_career_business' first to extract the correct ID, THEN call this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
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
      ...BUSINESS_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_business_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type FindByIdConfig = Parameters<typeof mcp.platform.career.businesses.findById>[1];
      const config: FindByIdConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const business = await mcp.platform.career.businesses.findById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', business);

      const fixedBusiness = fixOut(business);

      const schema = z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedBusiness);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Business with ID "${data.id}" was successfully found.` }],
      };
    }),
);

// ------------------------------------------------
// Delete Career Business By Id
// ------------------------------------------------
mcp.server.registerTool(
  'delete_career_business_by_id',
  {
    title: 'Delete Career Business By Id',
    description: `[ACTION] Soft-deletes a Career Business by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to remove or delete a specific business.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Delete the Acme business"), you MUST use 'find_career_business' first to retrieve the correct exact ID.
      [WARNING] DESTRUCTIVE ACTION: Make sure you have the correct ID before executing.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the business. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...BUSINESS_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('delete_career_business_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type DeleteConfig = Parameters<typeof mcp.platform.career.businesses.deleteById>[1];
      const config: DeleteConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const deletedBusiness = await mcp.platform.career.businesses.deleteById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', deletedBusiness);

      const fixedDeletedBusiness = fixOut(deletedBusiness);

      const schema = z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDeletedBusiness);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Business with ID "${safeData.id}" (Name: ${safeData.name || 'Unknown'}) was deleted.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Restore Career Business By Id
// ------------------------------------------------
mcp.server.registerTool(
  'restore_career_business_by_id',
  {
    title: 'Restore Career Business By Id',
    description: `[ACTION] Restores (un-deletes) a previously soft-deleted Career Business by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to restore, recover, reactivate, or undelete a specific business.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Restore the Acme business"), you MUST use 'find_career_business'
      (with appropriate filters for deleted items) first to retrieve the correct exact ID.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the business. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...BUSINESS_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('restore_career_business_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type RestoreConfig = Parameters<typeof mcp.platform.career.businesses.restoreById>[1];
      const config: RestoreConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const restoredBusiness = await mcp.platform.career.businesses.restoreById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', restoredBusiness);

      const fixedRestoredBusiness = fixOut(restoredBusiness);

      const schema = z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedRestoredBusiness);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Business with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was restored.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Destroy Career Business By Id
// ------------------------------------------------
mcp.server.registerTool(
  'destroy_career_business_by_id',
  {
    title: 'Destroy Career Business By Id',
    description: `[ACTION] Permanently destroys (hard-deletes) a Career Business by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to "permanently delete", "destroy", "purge", or "completely remove" a business.
      [RULES]
      1. CONFIRMATION REQUIRED: NEVER execute this tool immediately. First, explain to the user that this action is IRREVERSIBLE,
          show them the Business ID/Name, and ask for their explicit confirmation (e.g., "Are you absolutely sure?").
          ONLY call this tool AFTER the user replies "yes".
      2. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      3. CHAINING: If the exact ID is unknown, MUST use 'find_career_business' first to retrieve it.
      [WARNING] IRREVERSIBLE ACTION: This permanently removes the record from the database. It CANNOT be restored.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the business. Do not guess.'),
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
      ...BUSINESS_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('destroy_career_business_by_id');
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
                    "WARNING: You are about to PERMANENTLY destroy this business.
                    This action cannot be undone and the data will be lost forever.
                    To proceed, please reply with the exact phrase: CONFIRM_DESTROY"`,
            },
          ],
        };
      }

      logger('=== UNLOCKED: Executing Destruction ===');
      type DestroyConfig = Parameters<typeof mcp.platform.career.businesses.destroyById>[1];
      const config: DestroyConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const destroyedBusiness = await mcp.platform.career.businesses.destroyById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', destroyedBusiness);

      const fixedDestroyedBusiness = fixOut(destroyedBusiness);

      const schema = z.object({ ...BUSINESS_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDestroyedBusiness);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Business with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was destroyed.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Update Multiple Career Businesses in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_business_bulk',
  {
    title: 'Update Multiple Career Businesses (Bulk)',
    description: `[ACTION] Updates multiple Career Businesses matching a query in a single request.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, or change multiple businesses at once based on a filter.
      [RULES]
      1. NO HALLUCINATION: Build the AST query accurately from the user's intent.
      2. PARTIAL UPDATE: Only include the fields that actually need to be changed in the update payload.
      3. CONFIRMATION: If the query is broad (e.g., no conditions), warn the user before proceeding — this can affect many records.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe(
        'OPTIONAL. Query tree to select which businesses to update. Leave empty to match all accessible.',
      ),
      // Merge Business + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...BUSINESS_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of businesses that were updated.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_business_bulk');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      const { ast_query, ...updatePayload } = data;
      const mongoQuery = ast_query?.conditions?.length ? buildMongoQuery(ast_query as AstNode) : {};

      // Extract exact SDK type to enforce compile-time safety
      type UpdateBulkPayload = Parameters<typeof mcp.platform.career.businesses.updateBulk>[0];
      type UpdateBulkData = Parameters<typeof mcp.platform.career.businesses.updateBulk>[1];

      const filterPayload: UpdateBulkPayload = { query: mongoQuery } as UpdateBulkPayload;
      const safePayload = updatePayload as UpdateBulkData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const totalCount = await mcp.platform.career.businesses.updateBulk(filterPayload, safePayload, { headers });

      logger('=== 3. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `${safeData.count} business(es) were successfully updated.` }],
      };
    }),
);

// ------------------------------------------------
// Update Single Career Business By Id
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_business_by_id',
  {
    title: 'Update Career Business By Id',
    description: `[ACTION] Updates (patches) an existing Career Business by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, edit, or change an existing business.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Update the Acme business"), you MUST use 'find_career_business' first to retrieve it.
      3. PARTIAL UPDATE: Only provide the fields that actually need to be changed. Leave other fields empty.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BUSINESS_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the business to update. Do not guess.'),
      // Merge Business + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...BUSINESS_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      ...BUSINESS_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_business_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      // Separate 'id' and 'ref' from the actual update payload
      const { id, ref, ...updatePayload } = data;

      // Extract exact SDK type for config to enforce compile-time safety
      type UpdateByIdConfig = Parameters<typeof mcp.platform.career.businesses.updateById>[2];
      const config: UpdateByIdConfig = {
        headers,
        ...(ref && { params: { ref } }),
      };

      // Using 'as' here is safe because Zod has already validated the shape of the payload
      type UpdateByIdData = Parameters<typeof mcp.platform.career.businesses.updateById>[1];
      const safePayload = updatePayload as UpdateByIdData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const updatedBusiness = await mcp.platform.career.businesses.updateById(id, safePayload, config);

      logger('=== 3. RAW DB OUTPUT === : %j', updatedBusiness);

      const fixedUpdatedBusiness = fixOut(updatedBusiness);
      const schema = z.object({
        ...BUSINESS_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
      });
      const safeData = schema.parse(fixedUpdatedBusiness);

      logger('=== 4. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Business with ID "${id}" was successfully updated.`,
          },
        ],
      };
    }),
);
