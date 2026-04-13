import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { MAX_LEARNING_RATE, MAX_RATING_VALUE, MIN_LEARNING_RATE, MIN_RATING_VALUE } from '@app/common/core/constants';
import { CustomerType, LocationRange } from '@app/common/enums/career';
import { fixOut } from '@app/common/core/utils/mongo';
import { Status } from '@app/common/core/enums';
import { isMongoId } from 'class-validator';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const CUSTOMER_INPUT_SCHEMA_FIELDS = {
  type: z
    .nativeEnum(CustomerType)
    .describe(
      'REQUIRED. Customer type (e.g., VIP, LOYAL, REGULAR, OCCASIONAL). If not provided, DO NOT call this tool, you MUST ask the user.',
    ),
  range: z
    .nativeEnum(LocationRange)
    .optional()
    .describe('OPTIONAL. Geographic coverage range of the customer (e.g., CITY, COUNTRY, PROVINCE).'),
  profile: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid profile id' })
    .optional()
    .describe('OPTIONAL. Profile id (mongo id) linked to this customer.'),
  branch: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid branch id' })
    .optional()
    .describe('OPTIONAL. Branch id (mongo id) this customer is associated with.'),
  business: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid business id' })
    .describe(
      'REQUIRED. Business id (mongo id) this customer belongs to. If not provided, DO NOT call this tool, you MUST ask the user.',
    ),
  location: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid location id' })
    .optional()
    .describe('OPTIONAL. Location id (mongo id) associated with the customer.'),
  addresses: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid addresses id' }),
    )
    .optional()
    .describe('OPTIONAL. List of address ids (mongo ids) linked to the customer.'),
  stores: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid store id' }),
    )
    .optional()
    .describe('OPTIONAL. List of store ids (mongo ids) the customer is associated with.'),
  services: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid service id' }),
    )
    .optional()
    .describe('OPTIONAL. List of service ids (mongo ids) the customer uses.'),
  employees: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid employee id' }),
    )
    .optional()
    .describe('OPTIONAL. List of employee ids (mongo ids) assigned to or associated with this customer.'),
  status: z.nativeEnum(Status).optional().describe('OPTIONAL. Operational status of the customer (e.g., ACTIVE, INACTIVE).'),
  rate: z.number().min(MIN_LEARNING_RATE).max(MAX_LEARNING_RATE).optional().describe('OPTIONAL. Learning rate of the customer.'),
  votes: z.number().int().min(0).optional().describe('OPTIONAL. Number of votes for the customer.'),
  rating: z.number().min(MIN_RATING_VALUE).max(MAX_RATING_VALUE).optional().describe('OPTIONAL. Rating value of the customer.'),
  documents: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid document id' }),
    )
    .optional()
    .describe('OPTIONAL. List of document ids (mongo ids) belonging to this customer.'),
  certifications: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid certification id' }),
    )
    .optional()
    .describe('OPTIONAL. List of certification ids (mongo ids) held by this customer.'),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------

const CUSTOMER_OUTPUT_SCHEMA_FIELDS = {
  type: z.string().optional(),
  range: z.string().optional(),
  profile: z.string().optional(),
  branch: z.string().optional(),
  business: z.string().optional(),
  location: z.string().optional(),
  addresses: z.array(z.string()).optional(),
  stores: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  employees: z.array(z.string()).optional(),
  status: z.string().optional(),
  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),
  documents: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
};

// ------------------------------------------------------------------------------------------------
// Shared Data Dictionary
// ------------------------------------------------------------------------------------------------

const CUSTOMER_DATA_DICTIONARY = `
  type: REQUIRED. Customer type enum (VIP, LOYAL, REGULAR, OCCASIONAL).
  range: OPTIONAL. Geographic location range enum (CITY, COUNTY, DISTRICT, COUNTRY, PROVINCE, STATE, ROAD, SUBURB, QUARTER, VILLAGE, MUNICIPALITY).
  profile: OPTIONAL. Profile id (mongo id) linked to this customer.
  branch: OPTIONAL. Branch id (mongo id) the customer is associated with.
  business: REQUIRED. Business id (mongo id) the customer belongs to.
  location: OPTIONAL. Location id (mongo id) of the customer.
  addresses: OPTIONAL. List of address ids (mongo ids) linked to the customer.
  stores: OPTIONAL. List of store ids (mongo ids).
  services: OPTIONAL. List of service ids (mongo ids).
  employees: OPTIONAL. List of employee ids (mongo ids) assigned to this customer.
  status: OPTIONAL. Status enum (ACTIVE, INACTIVE, etc.).
  rate/votes/rating: OPTIONAL. Numeric performance metrics.
  documents: OPTIONAL. List of document ids (mongo ids).
  certifications: OPTIONAL. List of certification ids (mongo ids).
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
          MAPPINGS (Customer fields):
            "customer kind/category" -> type |
            "location range/coverage area" -> range |
            "customer profile/user profile" -> profile |
            "customer branch/assigned branch" -> branch |
            "company/organization/parent business" -> business |
            "customer location" -> location |
            "customer address/home address" -> addresses |
            "stores/assigned stores" -> stores |
            "services/used services" -> services |
            "employees/assigned employees" -> employees |
            "active/inactive/operational status" -> status |
            "learning rate/rate" -> rate |
            "number of votes/votes" -> votes |
            "score/rating" -> rating |
            "documents/files" -> documents |
            "certifications/certificates" -> certifications.
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
    Example for "type is VIP OR status is ACTIVE":
    {
      "logical": "and",
      "conditions": [
        {
          "logical": "or",
          "conditions": [
            { "field": "type", "operator": "eq", "value": "VIP" },
            { "field": "status", "operator": "eq", "value": "ACTIVE" }
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
// Search & Get Count Career Customers
// ------------------------------------------------
mcp.server.registerTool(
  'count_career_customer',
  {
    title: 'Get Count Career Customer',
    description:
      `[ACTION] Calculates and returns the EXACT total number of Career Customers matching criteria without fetching documents.
      [TRIGGER] Use ONLY when the user explicitly asks for "how many", "count", "number of", or "total" customers.
      [RULES]
      1. PERFORMANCE: Never use 'find_career_customer' to count items. Always use this tool to save network bandwidth.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    inputSchema: { ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Query tree. Leave empty to count all customers.') },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of customers matching the conditions.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('count_career_customer');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type CountPayload = Parameters<typeof mcp.platform.career.customers.count>[0];
      const payload: CountPayload = { query: mongoQuery } as CountPayload;

      const totalCount = await mcp.platform.career.customers.count(payload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `There are exactly ${safeData.count} customers matching your criteria.` }],
      };
    }),
);

// ------------------------------------------------
// Create Career Customer
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_customer',
  {
    title: 'Create Career Customer',
    description: `[ACTION] Creates a single new Career Customer.
      [TRIGGER] Use when the user explicitly asks to create or add a new customer.
      [RULES]
      1. ACCURACY: Ensure all REQUIRED fields (type, business) are present or ask the user before calling this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: { ...CUSTOMER_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: {
      ...CUSTOMER_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_customer');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create customer...');

      // Ensure payload matches platform SDK type
      type CreatePayload = Parameters<typeof mcp.platform.career.customers.create>[0];
      const payload = data as CreatePayload;

      const customer = await mcp.platform.career.customers.create(payload, { headers });
      const fixedCustomer = fixOut(customer);

      const schema = z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedCustomer);

      logger('A new customer created with ID: %s', safeData.id);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Customer "${safeData.id}" created successfully.` }],
      };
    }),
);

// ------------------------------------------------
// Creates Multiple Career Customers in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_customer_bulk',
  {
    title: 'Create Multiple Career Customers (Bulk)',
    description: `[ACTION] Creates multiple Career Customers in a single request (Bulk operation).
      [TRIGGER] Use when the user needs to create multiple customers at once.
      [RULES]
      1. PERFORMANCE: Prefer this tool over calling 'create_career_customer' multiple times in a loop.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      items: z
        .array(z.object({ ...CUSTOMER_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
        .min(1)
        .describe('REQUIRED. An array containing the customers to be created.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('List of the created customers.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_customer_bulk');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create bulk customers...');

      // Ensure payload matches platform SDK type
      type CreateBulkPayload = Parameters<typeof mcp.platform.career.customers.createBulk>[0];
      const bulkPayload = data as CreateBulkPayload;

      const customers = await mcp.platform.career.customers.createBulk(bulkPayload, { headers });
      const fixedCustomers = fixOut(customers);

      const schemaArray = z.array(z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(fixedCustomers);

      logger('%d customers created in bulk', safeDataArray.length);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `${safeDataArray.length} Customers created successfully in bulk.` }],
      };
    }),
);

// ------------------------------------------------
// Search & Get Career Customers
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_customer',
  {
    title: 'Find Career Customer',
    description: `[ACTION] Fetches Career Customers using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or find customers based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_career_customer' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
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
        .array(z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('The list of matching customers.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_customer');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type FindFilterPayload = Parameters<typeof mcp.platform.career.customers.find>[0];
      const filterPayload: FindFilterPayload = {
        query: mongoQuery,
        projection: data.projection as FindFilterPayload['projection'],
        populate: data.populate as FindFilterPayload['populate'],
        pagination: data.pagination as FindFilterPayload['pagination'],
      };

      const customersArray = await mcp.platform.career.customers.find(filterPayload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %j', customersArray);

      const schemaArray = z.array(z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(customersArray);

      logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} customers.` }],
      };
    }),
);

// ------------------------------------------------
// Find Career Customer By Id
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_customer_by_id',
  {
    title: 'Find Career Customer By Id',
    description:
      `[ACTION] Retrieves the complete, detailed record of a specific Career Customer using its exact MongoDB ObjectId or external reference (ref).
      [TRIGGER] Use when the user provides an exact ID or asks for full details of a specific customer identified in a previous step.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If searching by type or business, use 'find_career_customer' first to extract the correct ID, THEN call this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
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
      ...CUSTOMER_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_customer_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type FindByIdConfig = Parameters<typeof mcp.platform.career.customers.findById>[1];
      const config: FindByIdConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const customer = await mcp.platform.career.customers.findById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', customer);

      const fixedCustomer = fixOut(customer);

      const schema = z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedCustomer);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Customer with ID "${data.id}" was successfully found.` }],
      };
    }),
);

// ------------------------------------------------
// Delete Career Customer By Id
// ------------------------------------------------
mcp.server.registerTool(
  'delete_career_customer_by_id',
  {
    title: 'Delete Career Customer By Id',
    description: `[ACTION] Soft-deletes a Career Customer by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to remove or delete a specific customer.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Delete the VIP customer"), you MUST use 'find_career_customer' first to retrieve the correct exact ID.
      [WARNING] DESTRUCTIVE ACTION: Make sure you have the correct ID before executing.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the customer. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...CUSTOMER_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('delete_career_customer_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type DeleteConfig = Parameters<typeof mcp.platform.career.customers.deleteById>[1];
      const config: DeleteConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const deletedCustomer = await mcp.platform.career.customers.deleteById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', deletedCustomer);

      const fixedDeletedCustomer = fixOut(deletedCustomer);

      const schema = z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDeletedCustomer);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Customer with ID "${safeData.id}" was deleted.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Restore Career Customer By Id
// ------------------------------------------------
mcp.server.registerTool(
  'restore_career_customer_by_id',
  {
    title: 'Restore Career Customer By Id',
    description: `[ACTION] Restores (un-deletes) a previously soft-deleted Career Customer by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to restore, recover, reactivate, or undelete a specific customer.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Restore the loyal customer"), you MUST use 'find_career_customer'
      (with appropriate filters for deleted items) first to retrieve the correct exact ID.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the customer. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...CUSTOMER_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('restore_career_customer_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type RestoreConfig = Parameters<typeof mcp.platform.career.customers.restoreById>[1];
      const config: RestoreConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const restoredCustomer = await mcp.platform.career.customers.restoreById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', restoredCustomer);

      const fixedRestoredCustomer = fixOut(restoredCustomer);

      const schema = z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedRestoredCustomer);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Customer with ID ${safeData.id} was restored.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Destroy Career Customer By Id
// ------------------------------------------------
mcp.server.registerTool(
  'destroy_career_customer_by_id',
  {
    title: 'Destroy Career Customer By Id',
    description: `[ACTION] Permanently destroys (hard-deletes) a Career Customer by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to "permanently delete", "destroy", "purge", or "completely remove" a customer.
      [RULES]
      1. CONFIRMATION REQUIRED: NEVER execute this tool immediately. First, explain to the user that this action is IRREVERSIBLE,
          show them the Customer ID, and ask for their explicit confirmation (e.g., "Are you absolutely sure?").
          ONLY call this tool AFTER the user replies "yes".
      2. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      3. CHAINING: If the exact ID is unknown, MUST use 'find_career_customer' first to retrieve it.
      [WARNING] IRREVERSIBLE ACTION: This permanently removes the record from the database. It CANNOT be restored.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the customer. Do not guess.'),
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
      ...CUSTOMER_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('destroy_career_customer_by_id');
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
                    "WARNING: You are about to PERMANENTLY destroy this customer.
                    This action cannot be undone and the data will be lost forever.
                    To proceed, please reply with the exact phrase: CONFIRM_DESTROY"`,
            },
          ],
        };
      }

      logger('=== UNLOCKED: Executing Destruction ===');
      type DestroyConfig = Parameters<typeof mcp.platform.career.customers.destroyById>[1];
      const config: DestroyConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const destroyedCustomer = await mcp.platform.career.customers.destroyById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', destroyedCustomer);

      const fixedDestroyedCustomer = fixOut(destroyedCustomer);

      const schema = z.object({ ...CUSTOMER_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDestroyedCustomer);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Customer with ID ${safeData.id} was destroyed.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Update Multiple Career Customers in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_customer_bulk',
  {
    title: 'Update Multiple Career Customers (Bulk)',
    description: `[ACTION] Updates multiple Career Customers matching a query in a single request.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, or change multiple customers at once based on a filter.
      [RULES]
      1. NO HALLUCINATION: Build the AST query accurately from the user's intent.
      2. PARTIAL UPDATE: Only include the fields that actually need to be changed in the update payload.
      3. CONFIRMATION: If the query is broad (e.g., no conditions), warn the user before proceeding — this can affect many records.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe(
        'OPTIONAL. Query tree to select which customers to update. Leave empty to match all accessible.',
      ),
      // Merge Customer + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...CUSTOMER_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of customers that were updated.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_customer_bulk');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      const { ast_query, ...updatePayload } = data;
      const mongoQuery = ast_query?.conditions?.length ? buildMongoQuery(ast_query as AstNode) : {};

      // Extract exact SDK type to enforce compile-time safety
      type UpdateBulkPayload = Parameters<typeof mcp.platform.career.customers.updateBulk>[0];
      type UpdateBulkData = Parameters<typeof mcp.platform.career.customers.updateBulk>[1];

      const filterPayload: UpdateBulkPayload = { query: mongoQuery } as UpdateBulkPayload;
      const safePayload = updatePayload as UpdateBulkData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const totalCount = await mcp.platform.career.customers.updateBulk(filterPayload, safePayload, { headers });

      logger('=== 3. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `${safeData.count} customer(s) were successfully updated.` }],
      };
    }),
);

// ------------------------------------------------
// Update Single Career Customer By Id
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_customer_by_id',
  {
    title: 'Update Career Customer By Id',
    description: `[ACTION] Updates (patches) an existing Career Customer by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, edit, or change an existing customer.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Update the VIP customer"), you MUST use 'find_career_customer' first to retrieve it.
      3. PARTIAL UPDATE: Only provide the fields that actually need to be changed. Leave other fields empty.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${CUSTOMER_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the customer to update. Do not guess.'),
      // Merge Customer + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...CUSTOMER_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      ...CUSTOMER_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_customer_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      // Separate 'id' and 'ref' from the actual update payload
      const { id, ref, ...updatePayload } = data;

      // Extract exact SDK type for config to enforce compile-time safety
      type UpdateByIdConfig = Parameters<typeof mcp.platform.career.customers.updateById>[2];
      const config: UpdateByIdConfig = {
        headers,
        ...(ref && { params: { ref } }),
      };

      type UpdateByIdData = Parameters<typeof mcp.platform.career.customers.updateById>[1];
      const safePayload = updatePayload as UpdateByIdData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const updatedCustomer = await mcp.platform.career.customers.updateById(id, safePayload, config);

      logger('=== 3. RAW DB OUTPUT === : %j', updatedCustomer);

      const fixedUpdatedCustomer = fixOut(updatedCustomer);
      const schema = z.object({
        ...CUSTOMER_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
      });
      const safeData = schema.parse(fixedUpdatedCustomer);

      logger('=== 4. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Customer with ID "${id}" was successfully updated.`,
          },
        ],
      };
    }),
);
