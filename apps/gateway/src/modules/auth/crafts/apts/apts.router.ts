import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { CreateAptDto } from '@app/common/dto/auth';
import { fixOut } from '@app/common/core/utils/mongo';
import { toDate } from '@app/common/core/utils';
import { Scope } from '@app/common/core';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const APT_INPUT_SCHEMA_FIELDS = {
  name: z.string().trim().min(1, 'name is required').describe(`REQUIRED. Name for the apt token. You MUST ask the user for this.
      DO NOT call this tool without a real name provided by the user.`),

  expires_at: z.string().trim().describe(`REQUIRED. Expiration date. You (the AI) MUST convert the user input into
      an ISO 8601 format (YYYY-MM-DD) BEFORE calling this tool.
      Example: If user says "10 Mar 2027", send "2027-03-10".
      DO NOT call this tool without a real date provided by the user.`),

  strict: z
    .boolean()
    .optional()
    .describe(
      `OPTIONAL. If true, the user can only make requests via a client. If false, the user can make requests themselves. Leave empty if not specified.`,
    ),

  scopes: z
    .array(z.nativeEnum(Scope))
    .nonempty()
    .transform((arr) => [...new Set(arr)])
    .optional()
    .describe(
      `OPTIONAL. Array of permission scopes granted to this apt.
      If the user specifies scopes, you MUST strictly map their intent to the predefined Scope enum values.
      
      [SCOPE FORMATS & CATEGORIES]:
      1. Keywords: "none", "whole"
      2. Common Actions: "read", "write", "manage"
      3. Special Actions: "add", "send", "search", "init", "verify", "start", "abort", "commit", "share", "upload", "download", "collect", "payment", "resolve", "generate", "publish", "subscribe"
      4. Scoped Actions ("<action>:<domain>[:<sub-resource>]"):
         - Domains: auth, career, content, conjoint, context, domain, essential, financial, general, identity, logistic, special, touch, thing.
         - Examples: "read:identity:users", "write:career:products", "send:touch:smss", "payment:financial:invoices", "upload:special:files".

      [RULES]:
      - Always include the minimum scopes required for the apt functionality.
      - Duplicate scopes will be automatically removed.
      - Leave empty if not explicitly mentioned by the user.
      - If requested scopes are not clear or cannot be mapped exactly, DO NOT call this tool and ask the user to clarify.`,
    ),

  // RECHECK[VAHID]: DESCRIBE
  subjects: z
    .array(z.string().trim())
    .nonempty()
    .transform((arr) => [...new Set(arr)])
    .optional().describe(`OPTIONAL. Target entities this token can act upon.
      Leave empty if not explicitly mentioned by the user.`),

  coworkers: z
    .array(z.string().trim())
    .nonempty()
    .transform((arr) => [...new Set(arr)])
    .optional().describe(`OPTIONAL. Clients allowed to manage/revoke this token.
      Leave empty if not explicitly mentioned by the user.`),

  tz: z
    .string()
    .trim()
    .optional()
    .describe('OPTIONAL. The timezone context for the token (e.g., "Asia/Tehran"). Leave empty if not explicitly requested.'),

  // RECHECK[VAHID]: DESCRIBE
  lang: z
    .string()
    .trim()
    .optional()
    .describe('OPTIONAL. The language (e.g., "en", "fa"). Leave empty if not explicitly requested.'),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------

const APT_OUTPUT_SCHEMA_FIELDS = {
  token: z.string().optional().describe('The secret token value. This should be shown to the user.'),
  name: z.string().optional().describe('The name of the token.'),
  expires_at: z.number().optional().describe('The expiration timestamp of the token.'),
  strict: z.boolean().optional(),
  cid: z.string().optional().describe('cid means client id'),
  aid: z.string().optional().describe('aid means application id'),
  uid: z.string().optional().describe('uid means user id'),
  domain: z.string().optional().describe('Domain associated with the token'),
  scopes: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  tz: z.string().optional().describe('tz means timezone'),
  lang: z.string().optional().describe('lang means language'),
  session: z.string().optional().describe('User session identifier'),
  client_id: z.string().optional(),
  coworkers: z.array(z.string()).optional(),
};

// ------------------------------------------------------------------------------------------------
// Shared Data Dictionary
// ------------------------------------------------------------------------------------------------

const APT_DATA_DICTIONARY = `
  name: REQUIRED, The name of the apt token.
  expires_at: REQUIRED, Expiration timestamp of the token.
  scopes: OPTIONAL, Array of permission scopes granted to this apt.
  subjects: OPTIONAL, Target entities this token can act upon.
  coworkers: OPTIONAL, Team members allowed to manage/revoke this token.
  strict: OPTIONAL, BY DEFAULT IS FALSE, If true, limits the token usage to client requests only.
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
          MAPPINGS: "title" -> name | "expiration" -> expires_at.
          Support core fields (owner, shares, tags) & dot-notation. DO NOT invent fields.`,
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
    Example for "name is X OR strict is true":
    {
      "logical": "and",
      "conditions":[
        {
          "logical": "or",
          "conditions":[
            { "field": "name", "operator": "eq", "value": "X" },
            { "field": "strict", "operator": "eq", "value": true }
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
      if (regexStr.startsWith('.*') && regexStr.endsWith('.*')) {
        regexStr = regexStr.slice(2, -2);
      }
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
// Search & Get Count APTs
// ------------------------------------------------
mcp.server.registerTool(
  'count_auth_apt',
  {
    title: 'Get Count Auth APT',
    description:
      `[ACTION] Calculates and returns the EXACT total number of Authentication Personal Tokens (APTs) matching criteria without fetching documents.
      [TRIGGER] Use ONLY when the user explicitly asks for "how many", "count", "number of", or "total" APTs/tokens.
      [RULES]
      1. PERFORMANCE: Never use 'find_auth_apt' to count items. Always use this tool to save network bandwidth.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}[CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    // TODO: ADD ZONE LOGIC
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Query tree. Leave empty to count all accessible.'),
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of APTs matching the conditions.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('count_auth_apt');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type CountPayload = Parameters<typeof mcp.platform.auth.apts.count>[0];
      const payload: CountPayload = { query: mongoQuery } as CountPayload;

      const totalCount = await mcp.platform.auth.apts.count(payload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `There are exactly ${safeData.count} APTs matching your criteria.` }],
      };
    }),
);

// ------------------------------------------------
// Creates a single APT Grant
// ------------------------------------------------
mcp.server.registerTool(
  'create_auth_apt',
  {
    // ASK: SUBJECT AND SCOPES IS REQ OR OPTIONAL?
    title: 'Create a New APT',
    description: `[ACTION] Creates a single new Authentication Personal Token (APT).
      [TRIGGER] Use when the user explicitly asks to create, add, or generate a new token or APT.
      [RULES]
      1. ACCURACY: Ensure all REQUIRED fields (name, expires_at) are provided or explicitly asked from the user before calling this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: { ...APT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: {
      ...APT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data: any, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_auth_apt');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      const expiresAtTimestamp = toDate(data.expires_at).getTime();
      const createPayload: CreateAptDto = { ...data, expires_at: expiresAtTimestamp };

      const apt = await mcp.platform.auth.apts.create(createPayload, { headers });
      const fixedApt = fixOut(apt);

      const schema = z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedApt);

      logger('=== 2. FINAL MCP RESPONSE === : A new APT created with ID: %s', safeData.id);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `APT token "${safeData.name}" created successfully. Your token is: ${safeData.token}` }],
      };
    }),
);

// ------------------------------------------------
// Creates Multiple APTs in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'create_auth_apt_bulk',
  {
    title: 'Create Multiple APTs (Bulk)',
    description: `[ACTION] Creates multiple Authentication Personal Tokens in a single request (Bulk operation).
      [TRIGGER] Use when the user needs to generate multiple APTs at once.
      [RULES]
      1. PERFORMANCE: Always prefer this tool over calling 'create_auth_apt' multiple times in a loop.
      [WARNING] Ensure the items array is correctly formatted and all required fields are present for each item.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      items: z
        .array(z.object({ ...APT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
        .min(1)
        .describe('REQUIRED. An array containing the APTs to be created.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('List of the created APTs.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data: any, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_auth_apt_bulk');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      const items: CreateAptDto[] = data.items.map((item: any) => ({
        ...item,
        expires_at: toDate(item.expires_at).getTime(),
      }));

      const apts = await mcp.platform.auth.apts.createBulk({ items }, { headers });
      const fixedApts = fixOut(apts);

      const schemaArray = z.array(z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(fixedApts);

      logger('=== 2. FINAL MCP RESPONSE === : %d APTs created in bulk', safeDataArray.length);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `${safeDataArray.length} APTs created successfully in bulk.` }],
      };
    }),
);

// ------------------------------------------------
// Search & Get APTs
// ------------------------------------------------
mcp.server.registerTool(
  'find_auth_apt',
  {
    title: 'Find Auth APT',
    description: `[ACTION] Fetches Authentication Personal Tokens using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or check specific tokens based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_auth_apt' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}
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
        .array(z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('The list of matching APTs.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_auth_apt');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type FindFilterPayload = Parameters<typeof mcp.platform.auth.apts.find>[0];
      const filterPayload: FindFilterPayload = {
        query: mongoQuery,
        projection: data.projection as FindFilterPayload['projection'],
        populate: data.populate as FindFilterPayload['populate'],
        pagination: data.pagination as FindFilterPayload['pagination'],
      };

      const aptsArray = await mcp.platform.auth.apts.find(filterPayload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %j', aptsArray);

      const schemaArray = z.array(z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(aptsArray);

      logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} APTs.` }],
      };
    }),
);

// ------------------------------------------------
// Delete APT By Id
// ------------------------------------------------
mcp.server.registerTool(
  'delete_auth_apt_by_id',
  {
    title: 'Delete Auth APT By Id',
    description: `[ACTION] Soft-deletes an Authentication Personal Token by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to remove, revoke, or delete a specific token.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Delete token 'my-server'"), you MUST use 'find_auth_apt' first to retrieve the correct exact ID.
      [WARNING] DESTRUCTIVE ACTION: Make sure you have the correct ID before executing.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the APT. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...APT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('delete_auth_apt_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type DeleteConfig = Parameters<typeof mcp.platform.auth.apts.deleteById>[1];
      const config: DeleteConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const deletedApt = await mcp.platform.auth.apts.deleteById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', deletedApt);

      const fixedDeletedApt = fixOut(deletedApt);

      const schema = z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDeletedApt);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `APT with ID "${safeData.id}" (Name: ${safeData.name || 'Unknown'}) was deleted.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Find APT By Id
// ------------------------------------------------
mcp.server.registerTool(
  'find_auth_apt_by_id',
  {
    title: 'Find Auth APT By Id',
    description:
      `[ACTION] Retrieves the complete, detailed record of a specific APT using its exact MongoDB ObjectId or external reference (ref).
      [TRIGGER] Use when the user provides an exact ID or asks for full details of a specific token identified in a previous step.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If searching by name or scopes, use 'find_auth_apt' first to extract the correct ID, THEN call this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}[CONTEXT] MUST read "docs://schemas/core" before use.`
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
      ...APT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_auth_apt_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type FindByIdConfig = Parameters<typeof mcp.platform.auth.apts.findById>[1];
      const config: FindByIdConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const apt = await mcp.platform.auth.apts.findById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', apt);

      const fixedApt = fixOut(apt);

      const schema = z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedApt);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `APT with ID "${data.id}" was successfully found.` }],
      };
    }),
);

// ------------------------------------------------
// Restore APT By Id
// ------------------------------------------------
mcp.server.registerTool(
  'restore_auth_apt_by_id',
  {
    title: 'Restore Auth APT By Id',
    description: `[ACTION] Restores (un-deletes) a previously soft-deleted APT by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to restore, recover, reactivate, or undelete a specific token.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown, you MUST use 'find_auth_apt' (with appropriate filters for deleted items) first.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the APT. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...APT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('restore_auth_apt_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type RestoreConfig = Parameters<typeof mcp.platform.auth.apts.restoreById>[1];
      const config: RestoreConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const restoredApt = await mcp.platform.auth.apts.restoreById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', restoredApt);

      const fixedRestoredApt = fixOut(restoredApt);

      const schema = z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedRestoredApt);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `APT with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was restored.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Destroy APT By Id
// ------------------------------------------------
mcp.server.registerTool(
  'destroy_auth_apt_by_id',
  {
    title: 'Destroy Auth APT By Id',
    description: `[ACTION] Permanently destroys (hard-deletes) an APT by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to "permanently delete", "destroy", "purge", or "completely remove" a token.
      [RULES]
      1. CONFIRMATION REQUIRED: NEVER execute this tool immediately. First, explain to the user that this action is IRREVERSIBLE,
         show them the APT ID/Name, and ask for their explicit confirmation (e.g., "Are you absolutely sure?").
         ONLY call this tool AFTER the user replies "yes".
      2. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      3. CHAINING: If the exact ID is unknown, MUST use 'find_auth_apt' first to retrieve it.
      [WARNING] IRREVERSIBLE ACTION: This permanently removes the record from the database. It CANNOT be restored.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${APT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the APT. Do not guess.'),
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
      ...APT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('destroy_auth_apt_by_id');
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
                    "WARNING: You are about to PERMANENTLY destroy this APT token.
                    This action cannot be undone and the data will be lost forever.
                    To proceed, please reply with the exact phrase: CONFIRM_DESTROY"`,
            },
          ],
        };
      }

      logger('=== UNLOCKED: Executing Destruction ===');
      type DestroyConfig = Parameters<typeof mcp.platform.auth.apts.destroyById>[1];
      const config: DestroyConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const destroyedApt = await mcp.platform.auth.apts.destroyById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', destroyedApt);

      const fixedDestroyedApt = fixOut(destroyedApt);

      const schema = z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDestroyedApt);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `APT with ID ${safeData.id} (Name: ${safeData.name || 'Unknown'}) was destroyed.`,
          },
        ],
      };
    }),
);
