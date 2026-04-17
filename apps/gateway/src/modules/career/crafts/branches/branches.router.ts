import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { MAX_LEARNING_RATE, MAX_RATING_VALUE, MIN_LEARNING_RATE, MIN_RATING_VALUE } from '@app/common/core/constants';
import { fixOut } from '@app/common/core/utils/mongo';
import { BranchType } from '@app/common/enums/career';
import { State, Status } from '@app/common/core/enums';
import { z } from 'zod';
import { isDate, isMongoId, isPhoneNumber } from 'class-validator';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const BRANCH_INPUT_SCHEMA_FIELDS = {
  name: z
    .string()
    .trim()
    .optional()
    .describe('OPTIONAL. Name for the branch. LLM can suggest a name or leave empty if not explicitly requested.'),
  type: z.nativeEnum(BranchType).describe('REQUIRED. Branch type. If not provided, DO NOT call this tool, you MUST ask the user.'),
  business: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid business' })
    .describe('REQUIRED. Business (mongo id). If not provided, DO NOT call this tool, you MUST ask the user.'),
  code: z.string().trim().optional().describe('OPTIONAL. Short code for the branch.'),
  state: z.nativeEnum(State).optional().describe('OPTIONAL. State of the branch. For example: PENDING, APPROVED'),
  status: z.nativeEnum(Status).describe('REQUIRED. Status of the branch. For example: ACTIVE, INACTIVE'),
  rate: z.number().min(MIN_LEARNING_RATE).max(MAX_LEARNING_RATE).optional().describe('OPTIONAL. Learning rate of the branch.'),
  votes: z.number().int().min(0).optional().describe('OPTIONAL. Number of votes.'),
  rating: z.number().min(MIN_RATING_VALUE).max(MAX_RATING_VALUE).optional().describe('OPTIONAL. Rating value of the branch.'),
  parent: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid parent' })
    .optional()
    .describe('OPTIONAL. Parent branch id.'),
  manager: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid manager' })
    .optional()
    .describe('OPTIONAL. Manager id.'),
  location: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid location' })
    .optional()
    .describe('OPTIONAL. Location id.'),
  phone: z
    .string()
    .trim()
    .refine((val) => isPhoneNumber(val), { message: 'Invalid phone number' })
    .optional()
    .describe('OPTIONAL. Phone number.'),
  address: z.string().trim().optional().describe('OPTIONAL. Address.'),
  opening_date: z
    .string()
    .trim()
    .refine((val) => isDate(val), { message: 'Invalid date' })
    .optional()
    .describe('OPTIONAL. Opening date in ISO format.'),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------

const BRANCH_OUTPUT_SCHEMA_FIELDS = {
  name: z.string().optional(),
  type: z.string().optional(),
  business: z.string().optional(),
  code: z.string().optional(),
  state: z.string().optional(),
  status: z.string().optional(),
  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),
  parent: z.string().optional(),
  manager: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  opening_date: z.string().optional(),
};

// ------------------------------------------------------------------------------------------------
// Shared Data Dictionary
// ------------------------------------------------------------------------------------------------

const BRANCH_DATA_DICTIONARY = `
  name: OPTIONAL. Branch human-readable name.
  type: REQUIRED. Branch type (see BranchType enum).
  business: REQUIRED. Parent business id (mongo id).
  code: OPTIONAL. Short code.
  state: OPTIONAL. State enum.
  status: REQUIRED. Status enum.
  rate/votes/rating: OPTIONAL. Numeric metrics.
  parent/manager/location: OPTIONAL. Related entity ids.
  phone/address/opening_date: OPTIONAL. Contact and metadata.
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
          MAPPINGS (Branch fields):
            "branch name/title/label" -> name |
            "branch kind/category" -> type |
            "company/organization/parent company" -> business |
            "short code/abbreviation" -> code |
            "approval state" -> state |
            "active/inactive" -> status |
            "learning rate/rate" -> rate |
            "number of votes/votes" -> votes |
            "score/rating" -> rating |
            "parent branch" -> parent |
            "branch manager" -> manager |
            "branch location" -> location |
            "phone number/contact" -> phone |
            "address" -> address |
            "opening date/launch date" -> opening_date.
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
    Example for "type is ORIGIN OR status is ACTIVE":
    {
      "logical": "and",
      "conditions": [
        {
          "logical": "or",
          "conditions": [
            { "field": "type", "operator": "eq", "value": "ORIGIN" },
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
// Search & Get Count Career Branches
// ------------------------------------------------
mcp.server.registerTool(
  'count_career_branch',
  {
    title: 'Get Count Career Branch',
    description:
      `[ACTION] Calculates and returns the EXACT total number of Career Branches matching criteria without fetching documents.
      [TRIGGER] Use ONLY when the user explicitly asks for "how many", "count", "number of", or "total" branches.
      [RULES]
      1. PERFORMANCE: Never use 'find_career_branch' to count items. Always use this tool to save network bandwidth.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    inputSchema: { ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Query tree. Leave empty to count all branches.') },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of branches matching the conditions.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('count_career_branch');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type CountPayload = Parameters<typeof mcp.platform.career.branches.count>[0];
      const payload: CountPayload = { query: mongoQuery } as CountPayload;

      const totalCount = await mcp.platform.career.branches.count(payload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `There are exactly ${safeData.count} branches matching your criteria.` }],
      };
    }),
);
// ------------------------------------------------
// Create Career Branches
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_branch',
  {
    title: 'Create Career Branch',
    description: `[ACTION] Creates a single new Career Branch.
      [TRIGGER] Use when the user explicitly asks to create or add a new branch.
      [RULES]
      1. ACCURACY: Ensure all REQUIRED fields (type, business, status) are present or ask the user before calling this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: { ...BRANCH_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: {
      ...BRANCH_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_branch');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create branch...');

      // Ensure payload matches platform SDK type
      type CreatePayload = Parameters<typeof mcp.platform.career.branches.create>[0];
      const payload = data as CreatePayload;

      const branch = await mcp.platform.career.branches.create(payload, { headers });
      const fixedBranch = fixOut(branch);

      const schema = z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedBranch);

      logger('A new branch created with ID: %s', safeData.id);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Branch "${safeData.name || safeData.id}" created successfully.` }],
      };
    }),
);

// ------------------------------------------------
// Creates Multiple Career Branches in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_branch_bulk',
  {
    title: 'Create Multiple Career Branches (Bulk)',
    description: `[ACTION] Creates multiple Career Branches in a single request (Bulk operation).
      [TRIGGER] Use when the user needs to create multiple branches at once.
      [RULES]
      1. PERFORMANCE: Prefer this tool over calling 'create_career_branch' multiple times in a loop.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      items: z
        .array(z.object({ ...BRANCH_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
        .min(1)
        .describe('REQUIRED. An array containing the branches to be created.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('List of the created branches.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_branch_bulk');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create bulk branches...');

      // Ensure payload matches platform SDK type
      type CreateBulkPayload = Parameters<typeof mcp.platform.career.branches.createBulk>[0];
      const bulkPayload = data as CreateBulkPayload;

      const branches = await mcp.platform.career.branches.createBulk(bulkPayload, { headers });
      const fixedBranches = fixOut(branches);

      const schemaArray = z.array(z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(fixedBranches);

      logger('%d branches created in bulk', safeDataArray.length);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `${safeDataArray.length} Branches created successfully in bulk.` }],
      };
    }),
);

// ------------------------------------------------
// Search & Get Career Branches
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_branch',
  {
    title: 'Find Career Branch',
    description: `[ACTION] Fetches Career Branches using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or find branches based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_career_branch' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
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
        .array(z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('The list of matching branches.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_branch');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type FindFilterPayload = Parameters<typeof mcp.platform.career.branches.find>[0];
      const filterPayload: FindFilterPayload = {
        query: mongoQuery,
        projection: data.projection as FindFilterPayload['projection'],
        populate: data.populate as FindFilterPayload['populate'],
        pagination: data.pagination as FindFilterPayload['pagination'],
      };

      const branchesArray = await mcp.platform.career.branches.find(filterPayload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %j', branchesArray);

      const schemaArray = z.array(z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(branchesArray);

      logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} branches.` }],
      };
    }),
);

// ------------------------------------------------
// Find Career Branch By Id
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_branch_by_id',
  {
    title: 'Find Career Branch By Id',
    description:
      `[ACTION] Retrieves the complete, detailed record of a specific Career Branch using its exact MongoDB ObjectId or external reference (ref).
      [TRIGGER] Use when the user provides an exact ID or asks for full details of a specific branch identified in a previous step.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If searching by name or type, use 'find_career_branch' first to extract the correct ID, THEN call this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
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
      ...BRANCH_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_branch_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type FindByIdConfig = Parameters<typeof mcp.platform.career.branches.findById>[1];
      const config: FindByIdConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const branch = await mcp.platform.career.branches.findById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', branch);

      const fixedBranch = fixOut(branch);

      const schema = z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedBranch);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Branch with ID "${data.id}" was successfully found.` }],
      };
    }),
);

// ------------------------------------------------
// Delete Career Branch By Id
// ------------------------------------------------
mcp.server.registerTool(
  'delete_career_branch_by_id',
  {
    title: 'Delete Career Branch By Id',
    description: `[ACTION] Soft-deletes a Career Branch by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to remove or delete a specific branch.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Delete the downtown branch"), you MUST use 'find_career_branch' first to retrieve the correct exact ID.
      [WARNING] DESTRUCTIVE ACTION: Make sure you have the correct ID before executing.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the branch. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...BRANCH_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('delete_career_branch_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type DeleteConfig = Parameters<typeof mcp.platform.career.branches.deleteById>[1];
      const config: DeleteConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const deletedBranch = await mcp.platform.career.branches.deleteById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', deletedBranch);

      const fixedDeletedBranch = fixOut(deletedBranch);

      const schema = z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDeletedBranch);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Branch with ID "${safeData.id}" (Name: ${safeData.name || 'Unknown'}) was deleted.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Restore Career Branch By Id
// ------------------------------------------------
mcp.server.registerTool(
  'restore_career_branch_by_id',
  {
    title: 'Restore Career Branch By Id',
    description: `[ACTION] Restores (un-deletes) a previously soft-deleted Career Branch by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to restore, recover, reactivate, or undelete a specific branch.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Restore the north branch"), you MUST use 'find_career_branch'
      (with appropriate filters for deleted items) first to retrieve the correct exact ID.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the branch. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...BRANCH_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('restore_career_branch_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type RestoreConfig = Parameters<typeof mcp.platform.career.branches.restoreById>[1];
      const config: RestoreConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const restoredBranch = await mcp.platform.career.branches.restoreById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', restoredBranch);

      const fixedRestoredBranch = fixOut(restoredBranch);

      const schema = z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedRestoredBranch);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Branch with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was restored.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Destroy Career Branch By Id
// ------------------------------------------------
mcp.server.registerTool(
  'destroy_career_branch_by_id',
  {
    title: 'Destroy Career Branch By Id',
    description: `[ACTION] Permanently destroys (hard-deletes) a Career Branch by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to "permanently delete", "destroy", "purge", or "completely remove" a branch.
      [RULES]
      1. CONFIRMATION REQUIRED: NEVER execute this tool immediately. First, explain to the user that this action is IRREVERSIBLE,
          show them the Branch ID/Name, and ask for their explicit confirmation (e.g., "Are you absolutely sure?").
          ONLY call this tool AFTER the user replies "yes".
      2. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      3. CHAINING: If the exact ID is unknown, MUST use 'find_career_branch' first to retrieve it.
      [WARNING] IRREVERSIBLE ACTION: This permanently removes the record from the database. It CANNOT be restored.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the branch. Do not guess.'),
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
      ...BRANCH_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('destroy_career_branch_by_id');
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
                    "WARNING: You are about to PERMANENTLY destroy this branch.
                    This action cannot be undone and the data will be lost forever.
                    To proceed, please reply with the exact phrase: CONFIRM_DESTROY"`,
            },
          ],
        };
      }

      logger('=== UNLOCKED: Executing Destruction ===');
      type DestroyConfig = Parameters<typeof mcp.platform.career.branches.destroyById>[1];
      const config: DestroyConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const destroyedBranch = await mcp.platform.career.branches.destroyById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', destroyedBranch);

      const fixedDestroyedBranch = fixOut(destroyedBranch);

      const schema = z.object({ ...BRANCH_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDestroyedBranch);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Branch with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was destroyed.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Update Multiple Career Branches in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_branch_bulk',
  {
    title: 'Update Multiple Career Branches (Bulk)',
    description: `[ACTION] Updates multiple Career Branches matching a query in a single request.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, or change multiple branches at once based on a filter.
      [RULES]
      1. NO HALLUCINATION: Build the AST query accurately from the user's intent.
      2. PARTIAL UPDATE: Only include the fields that actually need to be changed in the update payload.
      3. CONFIRMATION: If the query is broad (e.g., no conditions), warn the user before proceeding — this can affect many records.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe(
        'OPTIONAL. Query tree to select which branches to update. Leave empty to match all accessible.',
      ),
      // Merge Branch + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...BRANCH_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of branches that were updated.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_branch_bulk');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      const { ast_query, ...updatePayload } = data;
      const mongoQuery = ast_query?.conditions?.length ? buildMongoQuery(ast_query as AstNode) : {};

      // Extract exact SDK type to enforce compile-time safety
      type UpdateBulkPayload = Parameters<typeof mcp.platform.career.branches.updateBulk>[0];
      type UpdateBulkData = Parameters<typeof mcp.platform.career.branches.updateBulk>[1];

      const filterPayload: UpdateBulkPayload = { query: mongoQuery } as UpdateBulkPayload;
      const safePayload = updatePayload as UpdateBulkData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const totalCount = await mcp.platform.career.branches.updateBulk(filterPayload, safePayload, { headers });

      logger('=== 3. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `${safeData.count} branch(es) were successfully updated.` }],
      };
    }),
);

// ------------------------------------------------
// Update Single Career Branch By Id
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_branch_by_id',
  {
    title: 'Update Career Branch By Id',
    description: `[ACTION] Updates (patches) an existing Career Branch by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, edit, or change an existing branch.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Update the main branch"), you MUST use 'find_career_branch' first to retrieve it.
      3. PARTIAL UPDATE: Only provide the fields that actually need to be changed. Leave other fields empty.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${BRANCH_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the branch to update. Do not guess.'),
      // Merge Branch + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...BRANCH_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      ...BRANCH_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_branch_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      // Separate 'id' and 'ref' from the actual update payload
      const { id, ref, ...updatePayload } = data;

      // Extract exact SDK type for config to enforce compile-time safety
      type UpdateByIdConfig = Parameters<typeof mcp.platform.career.branches.updateById>[2];
      const config: UpdateByIdConfig = {
        headers,
        ...(ref && { params: { ref } }),
      };

      // Using 'as' here is safe because Zod has already validated the shape of the payload
      type UpdateByIdData = Parameters<typeof mcp.platform.career.branches.updateById>[1];
      const safePayload = updatePayload as UpdateByIdData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const updatedBranch = await mcp.platform.career.branches.updateById(id, safePayload, config);

      logger('=== 3. RAW DB OUTPUT === : %j', updatedBranch);

      const fixedUpdatedBranch = fixOut(updatedBranch);
      const schema = z.object({
        ...BRANCH_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
      });
      const safeData = schema.parse(fixedUpdatedBranch);

      logger('=== 4. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Branch with ID "${id}" was successfully updated.`,
          },
        ],
      };
    }),
);
