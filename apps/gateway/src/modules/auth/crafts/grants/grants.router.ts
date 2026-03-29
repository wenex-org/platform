import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { isCron, isNetAdd, isSubject } from '@app/common/core/decorators/validation';
import { GrantDto } from '@app/common/interfaces/auth';
import { fixOut } from '@app/common/core/utils/mongo';
import { Action, Resource } from '@app/common/core';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const GRANT_TIME_SCHEMA = z.object({
  cron_exp: z
    .string()
    .trim()
    .refine((val) => isCron(val), { message: 'cron_exp must be a valid cron expression' })
    .describe(
      'REQUIRED. Cron expression that defines when the grant becomes active. If not provided, DO NOT call this tool, you MUST ask the user.',
    ),

  duration: z
    .number()
    .positive()
    .describe('REQUIRED. Duration of the grant in seconds. If not provided, DO NOT call this tool, you MUST ask the user.'),
});

const GRANT_INPUT_SCHEMA_FIELDS = {
  subject: z
    .string()
    .trim()
    .min(1)
    .refine((val) => isSubject(val), { message: 'Invalid subject' }).describe(`REQUIRED. User email receiving the grant.
      If not provided, DO NOT call this tool, you MUST ask the user.`),

  action: z.nativeEnum(Action).describe(`REQUIRED. Permission action (e.g., read:share).
    If not provided, DO NOT call this tool, you MUST ask the user.`),

  object: z
    .nativeEnum(Resource)
    .describe(`REQUIRED. Target resource type. If not provided, DO NOT call this tool, you MUST ask the user.`),

  field: z
    .array(z.string().trim())
    .optional()
    .describe(
      `OPTIONAL. Controls INPUT data (Write/Update access). Defines which properties of the payload the subject is allowed to send/modify.
      Uses 'notation' package syntax (dot-notation).
      Examples:
      - ['*'] -> Can modify everything.
      - ['*', '!role'] -> Can modify everything EXCEPT the role field.
      - ['status'] -> Can ONLY modify the status field.
      Leave empty if not explicitly requested.`,
    ),

  filter: z
    .array(z.string().trim())
    .optional()
    .describe(
      `OPTIONAL. Controls OUTPUT data (Read access). Defines which properties of the resource the subject is allowed to see in the response.
      Uses 'notation' package syntax (dot-notation).
      Examples:
      - ['*'] -> Can see everything.
      - ['*', '!password', '!secret'] -> Can see everything EXCEPT password and secret.
      - ['id', 'name'] -> Can ONLY see id and name.
      Leave empty if not explicitly requested.`,
    ),

  location: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isNetAdd(val), {
          message: 'Each location must be a valid IP address or CIDR notation',
        }),
    )
    .optional()
    .describe(
      'OPTIONAL. List of network addresses (IP/CIDR) allowed to access this resource. Leave empty if not explicitly requested.',
    ),

  time: z
    .array(GRANT_TIME_SCHEMA)
    .optional()
    .describe(
      'OPTIONAL. List of time rules defining when the grant is active. Each item contains a cron schedule and duration. Leave empty if not explicitly requested.',
    ),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------

const GRANT_OUTPUT_SCHEMA_FIELDS = {
  subject: z.string().optional().describe('User email receiving the grant.'),
  action: z.string().optional().describe('Permission action.'),
  object: z.string().optional().describe('Target resource type.'),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z
    .array(
      z.object({
        cron_exp: z.string().optional(),
        duration: z.number().optional(),
      }),
    )
    .optional(),
};

// ------------------------------------------------------------------------------------------------
// Search Schemas (Abstract Syntax Tree(AST) / Query Builder for LLM)
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

export type AstNode =
  | { logical: z.infer<typeof LOGICAL_OPERATOR>; conditions: AstNode[] }
  | { field: string; operator: z.infer<typeof FIELD_OPERATOR>; value: any };

const AST_NODE_SCHEMA: z.ZodType<AstNode> = z.lazy(() =>
  z.union([
    z.object({
      logical: LOGICAL_OPERATOR.describe("REQUIRED for grouping. Use 'and' (all must match) or 'or' (at least one must match)."),
      conditions: z.array(AST_NODE_SCHEMA).min(1).describe('REQUIRED. Array of nested conditions.'),
    }),

    z.object({
      field: z
        .string()
        .trim()
        .describe(
          `REQUIRED. The exact database field name. 
        CRITICAL MAPPING RULES FOR GRANTS:
        - If user asks for "name", "email", "user", or "who receives it" -> MUST use 'subject'
        - If user asks for "permission", "privilege", or "access level" -> MUST use 'action'
        - If user asks for "resource", "target", or "on what" -> MUST use 'object'
        - You can also query Core fields: 'owner', 'shares', 'groups', 'clients', 'tags', 'created_at'.
        - For nested arrays/objects, use dot-notation (e.g., 'time.duration', 'time.cron_exp').
        DO NOT invent field names.`,
        ),
      operator: FIELD_OPERATOR.describe('REQUIRED. The comparison or geospatial operator.'),
      value: z
        .union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.any())])
        .describe('REQUIRED. The value to match. For geo-queries, provide valid GeoJSON object.'),
    }),
  ]),
);

const ROOT_QUERY_SCHEMA = z.object({
  logical: z.literal('and').default('and').describe("The root must always be an 'and' operator."),
  conditions: z
    .array(AST_NODE_SCHEMA)
    .default([])
    .describe(
      `OPTIONAL. The AST conditions. 
    Example for "email is X OR role is Y":
    {
      "logical": "and",
      "conditions": [
        {
          "logical": "or",
          "conditions": [
            { "field": "subject", "operator": "eq", "value": "X" },
            { "field": "role", "operator": "eq", "value": "Y" }
          ]
        }
      ]
    }`,
    ),
});

function buildMongoQuery(node: AstNode): Record<string, any> {
  if ('logical' in node) {
    if (!node.conditions || node.conditions.length === 0) return {};

    const mappedConditions = node.conditions.map((child) => buildMongoQuery(child));

    return { [`$${node.logical}`]: mappedConditions };
  }

  const { field, operator, value } = node;

  switch (operator) {
    case 'eq':
      return { [field]: value };
    case 'regex':
      return { [field]: { $regex: String(value) } };
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

const ALLOWED_POPULATES = z.enum(['owner', 'shares', 'clients']);

// ------------------------------------------------------------------------------------------------
// Shared Date Dictionary
// ------------------------------------------------------------------------------------------------

const GRANT_DATA_DICTIONARY = `
  subject: User email receiving the grant. Use as name for a grant.
  action: Permission action (e.g., read:share).
  object: Target resource type.
  field: Controls INPUT data (Write/Update access). Defines which properties of the payload the subject is allowed to send/modify.
      Uses 'notation' package syntax (dot-notation).
      Examples:
      - ['*'] -> Can modify everything.
      - ['*', '!role'] -> Can modify everything EXCEPT the role field.
      - ['status'] -> Can ONLY modify the status field.

  filter: Controls OUTPUT data (Read access). Defines which properties of the resource the subject is allowed to see in the response.
      Uses 'notation' package syntax (dot-notation).
      Examples:
      - ['*'] -> Can see everything.
      - ['*', '!password', '!secret'] -> Can see everything EXCEPT password and secret.
      - ['id', 'name'] -> Can ONLY see id and name.

  location: List of network addresses (IP/CIDR) allowed to access this resource.
  time: List of time rules defining when the grant is active. Each item contains a cron schedule and duration.
  cron_exp: Cron expression that defines when the grant becomes active.
  duration: Duration of the grant in seconds.
`;

// ------------------------------------------------------------------------------------------------
// Search & Get Count Grants
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'get_count_grant',
  {
    title: 'Get Count of Grants',
    description: `Calculates and returns the EXACT total number of Authorization Grants matching specific criteria, without fetching the actual documents. 
                  Use this tool to search for permissions, check user access, or count grants based on specific criteria using advanced filtering.

                  CRITICAL TRIGGER: Use this tool ONLY when the user explicitly asks for "how many", "count", "number of", or "total" grants/permissions.
                  DO NOT use 'get_auth_grants' for counting, as it wastes network bandwidth.
                  
                  DATA DICTIONARY (Field Mappings):
                    ${CORE_DATA_DICTIONARY}, 
                    ${GRANT_DATA_DICTIONARY}
                  
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts at "docs://schemas/core".`,
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe(
        'OPTIONAL. The nested query tree. Leave empty to count all accessible grants.',
      ),
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of grants matching the conditions.'),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });

      mcp.log('get_count_grant')('=== 1. LLM INPUT (AST) === : %j', data);

      let mongoQuery: Record<string, any> = {};
      if (data.ast_query && data.ast_query.conditions && data.ast_query.conditions.length > 0) {
        mongoQuery = buildMongoQuery(data.ast_query as AstNode);
      }

      const totalCount = await mcp.platform.auth.grants.count({ query: mongoQuery } as any, { headers });

      mcp.log('get_count_grant')('=== 2. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `There are exactly ${safeData.count} grants matching your criteria.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------------------------------------------------------
// Creates a single Authorization Grant.
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'create_auth_grant',
  {
    title: 'Add a New Grant',
    description: `Creates a new Authorization Grant.
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts.
                  if you haven't read it yet, READ the resource at: "docs://schemas/core" to avoid permissions errors.`,
    inputSchema: { ...GRANT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: { ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS },
  },
  async (data: GrantDto, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('create_auth_grant')('Trying to create grant...');
      const grant = await mcp.platform.auth.grants.create(data, { headers });
      const fixedGrant = fixOut(grant);
      const allSafeData = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }).parse(fixedGrant);
      mcp.log('create_auth_grant')('A new grant created with ID: %s', allSafeData.id);
      const finalResponse = { ...allSafeData };
      return {
        structuredContent: finalResponse,
        content: [{ type: 'text', text: `Grant for subject "${finalResponse.subject}" created successfully.` }],
      };
    }),
);

// ------------------------------------------------------------------------------------------------
// Creates multiple Authorization Grants in bulk.
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'create_bulk_auth_grants',
  {
    title: 'Add Multiple Grants (Bulk)',
    description: `Creates multiple Authorization Grants in a single request (Bulk operation).
                  Use this tool whenever the user needs to assign multiple permissions at once to save network overhead.
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts.
                  if you haven't read it yet, READ the resource at: "docs://schemas/core" to avoid permissions errors.`,
    inputSchema: {
      items: z
        .array(z.object({ ...GRANT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
        .min(1)
        .describe('REQUIRED. An array containing the grants to be created.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .describe('List of the created grants.'),
    },
  },
  async (data: { items: GrantDto[] }, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('create_bulk_auth_grants')('Trying to create bulk grants...');
      const grants = await mcp.platform.auth.grants.createBulk({ items: data.items }, { headers });
      const fixedGrants = fixOut(grants);
      const allSafeDataArray = z
        .array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .parse(fixedGrants);
      mcp.log('create_bulk_auth_grants')('%d grants created in bulk', allSafeDataArray.length);
      const finalResponseItems = allSafeDataArray;
      return {
        structuredContent: { items: finalResponseItems },
        content: [{ type: 'text', text: `${finalResponseItems.length} Grants created successfully in bulk.` }],
      };
    }),
);

// ------------------------------------------------------------------------------------------------
// Search & Get Authorization Grants
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'get_auth_grants',
  {
    title: 'Search and Get Grants',
    description: `Fetches Authorization Grants from the database with advanced filtering, pagination, and relation population.
                  Use this tool to search for permissions, check user access, or list grants based on specific criteria.
                  
                  DATA DICTIONARY (Field Mappings):
                    ${CORE_DATA_DICTIONARY}, 
                    ${GRANT_DATA_DICTIONARY}
                    
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts at "docs://schemas/core".`,
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. The nested AST query tree for advanced filtering.'),
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
        .array(
          z.object({
            ...GRANT_OUTPUT_SCHEMA_FIELDS,
            ...CORE_OUTPUT_SCHEMA_FIELDS,
          }),
        )
        .describe('The list of matching grants.'),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });

      mcp.log('get_auth_grants')('=== 1. LLM INPUT (AST & Config) === : %j', data);

      let mongoQuery: Record<string, any> = {};
      if (data.ast_query && data.ast_query.conditions && data.ast_query.conditions.length > 0) {
        mongoQuery = buildMongoQuery(data.ast_query as AstNode);
      }

      const filterPayload = {
        query: mongoQuery,
        projection: data.projection,
        populate: data.populate,
        pagination: data.pagination,
      };

      const grantsArray = await mcp.platform.auth.grants.find(filterPayload as any, { headers });

      mcp.log('get_auth_grants')('=== 2. RAW DB OUTPUT === : %j', grantsArray);

      const DynamicOutputSchema = z.object({
        ...GRANT_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
      });

      let safeDataArray;
      try {
        safeDataArray = z.array(DynamicOutputSchema).parse(grantsArray);
        mcp.log('get_auth_grants')('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);
      } catch (error) {
        mcp.log('get_auth_grants')('=== ❌ ZOD ERROR ❌ === : %j', error);
        throw error;
      }

      const finalResponsePayload = { items: safeDataArray };

      mcp.log('get_auth_grants')('=== 4. FINAL MCP RESPONSE === : %j', finalResponsePayload);

      return {
        structuredContent: finalResponsePayload,
        content: [
          {
            type: 'text',
            text: `Search completed successfully. Found ${safeDataArray.length} grants.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------------------------------------------------------
// Delete an Authorization Grant
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'delete_auth_grant',
  {
    title: 'Delete a Grant',
    description: `Soft-deletes an Authorization Grant by its exact ID.
                  CRITICAL RULE: You MUST NOT guess or invent the ID. If the user asks to delete a grant by its name or subject (e.g., "Delete Ali's grant"), you MUST FIRST use 'get_auth_grants' to find the exact MongoDB ObjectId, and THEN call this tool.
                  
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts at "docs://schemas/core".`,
    inputSchema: {
      id: z
        .string()
        .trim()
        .min(1)
        .describe('REQUIRED. The exact MongoDB ObjectId of the grant to be deleted. Do not guess this value.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },

    outputSchema: {
      ...GRANT_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });

      mcp.log('delete_auth_grant')('=== 1. LLM INPUT === : %j', data);

      const axiosConfig: Record<string, any> = { headers };
      if (data.ref) {
        axiosConfig.params = { ref: data.ref };
      }

      const deleteUrl = `/auth/grants/${data.id}`;

      const response = await mcp.platform.auth.grants.delete(deleteUrl, axiosConfig as any);

      mcp.log('delete_auth_grant')('=== 2. RAW DB OUTPUT === : %j', response);

      const actualData = (response as any)?.data || response;
      const fixedGrant = fixOut(actualData);

      const OutputSchema = z.object({
        ...GRANT_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
      });

      const safeData = OutputSchema.parse(fixedGrant);

      mcp.log('delete_auth_grant')('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Grant with ID "${safeData.id}" (Subject: ${safeData.subject || 'Unknown'}) was successfully deleted.`,
          },
        ],
      };
    }),
);
