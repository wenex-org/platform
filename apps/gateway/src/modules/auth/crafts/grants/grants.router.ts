import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { isCron, isNetAdd, isSubject } from '@wenex/sdk/common/core/decorators/validation';
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
// Search Schemas (AST / Query Builder for LLM)
// ------------------------------------------------------------------------------------------------

const Filter_Operator = z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'regex', 'exists']);

const Query_Condition_Schema = z.object({
  field: z.string().trim().describe("REQUIRED. The field name to query (e.g., 'subject', 'action', 'object', 'createdAt')."),

  operator: Filter_Operator.default('eq').describe(
    "REQUIRED. The comparison operator. Use 'regex' for partial text match, and 'exists' for null checks.",
  ),

  value: z.any().describe(
    `REQUIRED. The value to match. 
      CRITICAL RULES:
      - If 'operator' is 'in' or 'nin', MUST be an array.
      - If 'operator' is 'exists', MUST be a boolean.
      - If querying a DATE (like createdAt), you MUST calculate relative dates based on today and convert to strictly ISO 8601 format string.`,
  ),
});

const Allowed_Populates = z.enum(['owner', 'shares', 'clients']);
const Populated_Reference_Schema = z
  .union([
    z.string(),
    z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
      })
      .passthrough(),
  ])
  .optional();

// ------------------------------------------------------------------------------------------------
// Count Authorization Grants
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'get_count_grant',
  {
    title: 'Get Count of Grants',
    description: `Calculates and returns the EXACT total number of Authorization Grants matching specific criteria, without fetching the actual documents.
                  CRITICAL TRIGGER: Use this tool ONLY when the user explicitly asks for "how many", "count", "number of", or "total" grants/permissions. 
                  DO NOT use 'get_auth_grants' for counting, as it wastes network bandwidth.
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts at "docs://schemas/core".`,
    inputSchema: {
      conditions: z
        .array(Query_Condition_Schema)
        .optional()
        .describe(
          `OPTIONAL. Array of search conditions (AST) to filter which grants should be counted.
          Example: [{ field: "action", operator: "eq", value: "read:share" }]
          Leave empty to get the total count of all grants in the system.`,
        ),
      ...CORE_INPUT_SCHEMA_FIELDS,
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of grants matching the conditions.'),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('get_count_grant')('Building count query from LLM conditions: %j', data.conditions);

      // Transform LLM AST to native MongoDB Query
      const mongoQuery: Record<string, any> = {};

      if (data.conditions && data.conditions.length > 0) {
        const queryParts = data.conditions.map((cond) => {
          if (cond.operator === 'eq') return { [cond.field]: cond.value };
          return { [cond.field]: { [`$${cond.operator}`]: cond.value } };
        });

        if (queryParts.length === 1) {
          Object.assign(mongoQuery, queryParts[0]);
        } else {
          mongoQuery['$and'] = queryParts;
        }
      }

      mcp.log('get_count_grant')('Fetching count from platform SDK...');

      // Call the Count SDK endpoint
      const totalCount = await mcp.platform.auth.grants.count({ query: mongoQuery } as any, { headers });
      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });
      mcp.log('get_count_grant')('Counted %d grants matching the criteria', safeData.count);

      // Return MCP compliant format
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
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts at "docs://schemas/core".`,
    inputSchema: {
      conditions: z
        .array(Query_Condition_Schema)
        .optional()
        .describe(
          `OPTIONAL. Array of search conditions (AST). Do not invent conditions, ask user if unsure.
          Example: [{ field: "subject", operator: "eq", value: "user@example.com" }]`,
        ),

      projection: z
        .array(z.string().trim())
        .optional()
        .describe(`OPTIONAL. Controls output fields (Dot-notation). Leave empty to let system decide. Do not invent.`),

      populate: z
        .array(Allowed_Populates)
        .optional()
        .describe('OPTIONAL. Relations to join. Only use if user explicitly needs related data. Do not invent.'),

      pagination: z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
        })
        .optional()
        .describe('OPTIONAL. Pagination config. Default is page 1, limit 20.'),

      ...CORE_INPUT_SCHEMA_FIELDS,
    },
    outputSchema: {
      items: z
        .array(
          z.object({
            ...GRANT_OUTPUT_SCHEMA_FIELDS,
            ...CORE_OUTPUT_SCHEMA_FIELDS,
            // Override Reference fields to support Type Shifting (String ID vs Populated Object)
            owner: Populated_Reference_Schema,
            shares: z.array(Populated_Reference_Schema).optional(),
            clients: z.array(Populated_Reference_Schema).optional(),
          }),
        )
        .describe('The list of matching grants.'),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('get_auth_grants')('Building query from LLM conditions: %j', data.conditions);

      // Transform LLM AST to native MongoDB Query (FilterDto.query) safely
      const mongoQuery: Record<string, any> = {};

      if (data.conditions && data.conditions.length > 0) {
        const queryParts = data.conditions.map((cond) => {
          // Cast values to prevent mongo syntax errors based on operator
          if (cond.operator === 'eq') return { [cond.field]: cond.value };

          if (cond.operator === 'regex') return { [cond.field]: { $regex: String(cond.value) } };

          if (cond.operator === 'exists') return { [cond.field]: { $exists: Boolean(cond.value) } };

          return { [cond.field]: { [`$${cond.operator}`]: cond.value } };
        });

        // Use $and to prevent key overriding when multiple conditions target the same field
        if (queryParts.length === 1) {
          Object.assign(mongoQuery, queryParts[0]);
        } else {
          mongoQuery['$and'] = queryParts;
        }
      }

      // Build the precise FilterDto expected by SDK
      const filterPayload = {
        query: mongoQuery,
        projection: data.projection,
        populate: data.populate,
        pagination: data.pagination || { page: 1, limit: 20 },
      };

      mcp.log('get_auth_grants')('Fetching grants from platform SDK...');

      const grantsArray = await mcp.platform.auth.grants.find(filterPayload as any, { headers });
      const fixedGrants = fixOut(grantsArray);

      // Safe mapping utilizing the overridden Type Shifting schema
      const DynamicOutputSchema = z.object({
        ...GRANT_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
        owner: Populated_Reference_Schema,
        shares: z.array(Populated_Reference_Schema).optional(),
        clients: z.array(Populated_Reference_Schema).optional(),
      });

      const safeDataArray = z.array(DynamicOutputSchema).parse(fixedGrants);

      mcp.log('get_auth_grants')('Found %d grants matching the criteria', safeDataArray.length);

      // Return strictly compliant MCP format
      return {
        structuredContent: {
          items: safeDataArray,
        },
        content: [
          {
            type: 'text',
            text: `Search completed successfully. Found ${safeDataArray.length} grants.`,
          },
        ],
      };
    }),
);
