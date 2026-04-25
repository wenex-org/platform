// import {
//   CORE_INPUT_SCHEMA_FIELDS,
//   CORE_OUTPUT_SCHEMA_FIELDS,
//   CORE_DATA_DICTIONARY,
//   getHeaders,
//   ServerMCP,
//   throwableToolCall,
// } from '@app/common/core/mcp';
// import { isCron, isNetAdd, isSubject } from '@app/common/core/decorators/validation';
// import { GrantDto } from '@app/common/interfaces/auth';
// import { fixOut } from '@app/common/core/utils/mongo';
// import { Action, Resource } from '@app/common/core';
// import { z } from 'zod';

// const mcp = ServerMCP.create();

// // ------------------------------------------------------------------------------------------------
// // Shared Input Schemas
// // ------------------------------------------------------------------------------------------------

// const GRANT_TIME_SCHEMA = z.object({
//   cron_exp: z
//     .string()
//     .trim()
//     .refine((val) => isCron(val), { message: 'cron_exp must be a valid cron expression' })
//     .describe(
//       `REQUIRED. Cron expression that defines when the grant becomes active.
//       If not provided, DO NOT call this tool, you MUST ask the user.`,
//     ),
//   duration: z
//     .number()
//     .positive()
//     .describe('REQUIRED. Duration of the grant in seconds. If not provided, DO NOT call this tool, you MUST ask the user.'),
// });

// const GRANT_INPUT_SCHEMA_FIELDS = {
//   subject: z
//     .string()
//     .trim()
//     .min(1)
//     .refine((val) => isSubject(val), { message: 'Invalid subject' })
//     .describe('REQUIRED. User email receiving the grant. If not provided, DO NOT call this tool, you MUST ask the user.'),
//   action: z
//     .nativeEnum(Action)
//     .describe('REQUIRED. Permission action (e.g., read:share). If not provided, DO NOT call this tool, you MUST ask the user.'),
//   object: z
//     .nativeEnum(Resource)
//     .describe('REQUIRED. Target resource type. If not provided, DO NOT call this tool, you MUST ask the user.'),
//   field: z
//     .array(z.string().trim())
//     .optional()
//     .describe(
//       `OPTIONAL. Controls INPUT data (Write/Update access) via 'notation' syntax.
//         Examples: ['*'] (All), ['*', '!role'] (All except role), ['status'] (Only status).
//         Leave empty if not explicitly requested.`,
//     ),
//   filter: z
//     .array(z.string().trim())
//     .optional()
//     .describe(
//       `OPTIONAL. Controls OUTPUT data (Read access) via 'notation' syntax.
//         Examples: ['*'] (All), ['*', '!password'] (All except password).
//         Leave empty if not explicitly requested.`,
//     ),
//   location: z
//     .array(
//       z
//         .string()
//         .trim()
//         .refine((val) => isNetAdd(val), {
//           message: 'Each location must be a valid IP address or CIDR notation.',
//         }),
//     )
//     .optional()
//     .describe(
//       `OPTIONAL. List of network addresses (IP/CIDR) allowed to access this resource.
//       Leave empty if not explicitly requested.`,
//     ),
//   time: z.array(GRANT_TIME_SCHEMA).optional().describe(`OPTIONAL. List of time rules defining when the grant is active.
//     Leave empty if not explicitly requested.`),
// };

// // ------------------------------------------------------------------------------------------------
// // Shared Output Schemas
// // ------------------------------------------------------------------------------------------------

// const GRANT_OUTPUT_SCHEMA_FIELDS = {
//   subject: z.string().optional().describe('User email receiving the grant.'),
//   action: z.string().optional().describe('Permission action.'),
//   object: z.string().optional().describe('Target resource type.'),
//   field: z.array(z.string()).optional(),
//   filter: z.array(z.string()).optional(),
//   location: z.array(z.string()).optional(),
//   time: z
//     .array(
//       z.object({
//         cron_exp: z.string().optional(),
//         duration: z.number().optional(),
//       }),
//     )
//     .optional(),
// };

// // ------------------------------------------------------------------------------------------------
// // Shared Data Dictionary
// // ------------------------------------------------------------------------------------------------

// const GRANT_DATA_DICTIONARY = `
//   subject: User email receiving the grant. Use as name for a grant.
//   action: Permission action (e.g., read:share).
//   object: Target resource type.
//   field: Controls INPUT data (Write/Update access). Defines properties the subject can modify via 'notation' syntax (dot-notation).
//   filter: Controls OUTPUT data (Read access). Defines properties the subject can see in the response via 'notation' syntax (dot-notation).
//   location: List of network addresses (IP/CIDR) allowed to access this resource.
//   time: List of time rules defining when the grant is active. Each item contains a cron schedule and duration.
//   cron_exp: Cron expression that defines when the grant becomes active.
//   duration: Duration of the grant in seconds.
// `.trim();

// // ------------------------------------------------------------------------------------------------
// // Search Schemas (Abstract Syntax Tree (AST) / Query Builder for LLM)
// // ------------------------------------------------------------------------------------------------

// const FIELD_OPERATOR = z.enum([
//   'eq',
//   'ne',
//   'gt',
//   'gte',
//   'lt',
//   'lte',
//   'in',
//   'nin',
//   'regex',
//   'exists',
//   'near',
//   'nearSphere',
//   'geoWithin',
//   'geoIntersects',
// ]);

// const LOGICAL_OPERATOR = z.enum(['and', 'or']);
// const ALLOWED_POPULATES = z.enum(['owner', 'shares', 'clients', 'groups']);

// export type AstNode =
//   | { logical: z.infer<typeof LOGICAL_OPERATOR>; conditions: AstNode[] }
//   | { field: string; operator: z.infer<typeof FIELD_OPERATOR>; value: any };

// const AST_NODE_SCHEMA: z.ZodType<AstNode> = z.lazy(() =>
//   z.union([
//     z.object({
//       logical: LOGICAL_OPERATOR.describe("REQUIRED for grouping. Use 'and' or 'or'."),
//       conditions: z.array(AST_NODE_SCHEMA).min(1).describe('REQUIRED. Array of nested conditions.'),
//     }),
//     z.object({
//       field: z
//         .string()
//         .trim()
//         .describe(
//           `REQUIRED. Exact DB field name.
//           MAPPINGS: "name/email/user" -> subject | "permission/privilege/access level" -> action | "resource/target/on what" -> object.
//             Support core fields (owner, shares, tags) & dot-notation (time.duration). DO NOT invent fields.`,
//         ),
//       operator: FIELD_OPERATOR.describe(
//         `REQUIRED. Comparison or geospatial operator.
//         [CRITICAL RULE FOR 'regex']: If the user asks for a "contains", "like", or "search" operation, you MUST use the 'regex' operator and pass ONLY the raw exact string in 'value'.
//         DO NOT manually add '.*', '^', or '$' wildcards.`,
//       ),
//       value: z
//         .union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.any())])
//         .describe('REQUIRED. The value to match.'),
//     }),
//   ]),
// );

// const ROOT_QUERY_SCHEMA = z.object({
//   logical: z.literal('and').default('and').describe("The root must always be an 'and' operator."),
//   conditions: z.array(AST_NODE_SCHEMA).default([]).describe(`OPTIONAL. The nested AST conditions.
//     Example for "email is X OR role is Y":
//     {
//       "logical": "and",
//       "conditions": [
//         {
//           "logical": "or",
//           "conditions": [
//             { "field": "subject", "operator": "eq", "value": "X" },
//             { "field": "role", "operator": "eq", "value": "Y" }
//           ]
//         }
//       ]
//     }`),
// });

// // Recursively builds a MongoDB query object from the AST node
// function buildMongoQuery(node: AstNode): Record<string, any> {
//   if ('logical' in node) {
//     if (!node.conditions?.length) return {};
//     const mappedConditions = node.conditions.map((child) => buildMongoQuery(child));
//     return { [`$${node.logical}`]: mappedConditions };
//   }

//   const { field, operator, value } = node;

//   switch (operator) {
//     case 'eq':
//       return { [field]: value };

//     case 'regex': {
//       let regexStr = String(value);
//       // Clean up LLM hallucinations: Remove leading and trailing '.*' if they exist
//       if (regexStr.startsWith('.*') && regexStr.endsWith('.*')) {
//         regexStr = regexStr.slice(2, -2);
//       }

//       /*
//       - Add $options: 'i' to make the search case-insensitive
//       - BUT PLATFORM NOT SUPPORT $options
//       - return { [field]: { $regex: regexStr, $options: 'i' } };
//       */
//       return { [field]: { $regex: regexStr } };
//     }

//     case 'exists':
//       return { [field]: { $exists: Boolean(value) } };

//     case 'near':
//     case 'nearSphere':
//     case 'geoWithin':
//     case 'geoIntersects':
//       return { [field]: { [`$${operator}`]: value } };

//     default:
//       return { [field]: { [`$${operator}`]: value } };
//   }
// }

// // ------------------------------------------------------------------------------------------------
// // Tools Implementation
// // ------------------------------------------------------------------------------------------------
// // ------------------------------------------------
// // Search & Get Count Grants
// // ------------------------------------------------
// mcp.server.registerTool(
//   'count_auth_grant',
//   {
//     title: 'Get Count Auth Grant',
//     description:
//       `[ACTION] Calculates and returns the EXACT total number of Authorization Grants matching criteria without fetching documents.
//           [TRIGGER] Use ONLY when the user explicitly asks for "how many", "count", "number of", or "total" grants/permissions.
//           [RULES]
//           1. PERFORMANCE: Never use 'find_auth_grant' to count items. Always use this tool to save network bandwidth.
//           [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//           [CONTEXT] MUST read "docs://schemas/core" before use.`
//         .replace(/\s+/g, ' ')
//         .trim(),
//     inputSchema: {
//       ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Query tree. Leave empty to count all accessible.'),
//     },
//     outputSchema: {
//       count: z.number().min(0).optional().describe('The total number of grants matching the conditions.'),
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('count_auth_grant');
//       const headers = getHeaders({ requestInfo });

//       logger('=== 1. LLM INPUT (AST) === : %j', data);

//       const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

//       // Extract exact SDK type for payload to enforce compile-time safety
//       type CountPayload = Parameters<typeof mcp.platform.auth.grants.count>[0];
//       const payload: CountPayload = { query: mongoQuery } as CountPayload;

//       const totalCount = await mcp.platform.auth.grants.count(payload, { headers });

//       logger('=== 2. RAW DB OUTPUT === : %s', totalCount);

//       const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

//       return {
//         structuredContent: safeData,
//         content: [{ type: 'text', text: `There are exactly ${safeData.count} grants matching your criteria.` }],
//       };
//     }),
// );

// // ------------------------------------------------
// // Creates a single Authorization Grant.
// // ------------------------------------------------
// mcp.server.registerTool(
//   'create_auth_grant',
//   {
//     title: 'Create a New Auth Grant',
//     description: `[ACTION] Creates a single new Authorization Grant.
//           [TRIGGER] Use when the user explicitly asks to create, add, or assign a new permission/grant to a user.
//           [RULES]
//           1. ACCURACY: Ensure all REQUIRED fields (subject, action, object) are provided or explicitly asked from the user before calling this tool.
//           [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//           [CONTEXT] MUST read "docs://schemas/core" before use.`
//       .replace(/\s+/g, ' ')
//       .trim(),
//     inputSchema: { ...GRANT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
//     outputSchema: {
//       ...GRANT_OUTPUT_SCHEMA_FIELDS,
//       ...CORE_OUTPUT_SCHEMA_FIELDS,
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data: GrantDto, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('create_auth_grant');
//       const headers = getHeaders({ requestInfo });

//       logger('Trying to create grant...');

//       const grant = await mcp.platform.auth.grants.create(data, { headers });
//       const fixedGrant = fixOut(grant);

//       // Strict validation of the newly created entity against exact schemas
//       const schema = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
//       const safeData = schema.parse(fixedGrant);

//       logger('A new grant created with ID: %s', safeData.id);

//       return {
//         structuredContent: safeData,
//         content: [{ type: 'text', text: `Grant for subject "${safeData.subject}" created successfully.` }],
//       };
//     }),
// );

// // ------------------------------------------------
// // Creates Multiple Auth Grants in Bulk.
// // ------------------------------------------------
// mcp.server.registerTool(
//   'create_auth_grant_bulk',
//   {
//     title: 'Create Multiple Grants (Bulk)',
//     description: `[ACTION] Creates multiple Authorization Grants in a single request (Bulk operation).
//       [TRIGGER] Use when the user needs to assign multiple permissions/grants at once.
//       [RULES]
//       1. PERFORMANCE: Always prefer this tool over calling 'create_auth_grant' multiple times in a loop to save network overhead.
//       [WARNING] Ensure the items array is correctly formatted and all required fields are present for each item.
//       [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//       [CONTEXT] MUST read "docs://schemas/core" before use.`
//       .replace(/\s+/g, ' ')
//       .trim(),
//     inputSchema: {
//       items: z
//         .array(z.object({ ...GRANT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
//         .min(1)
//         .describe('REQUIRED. An array containing the grants to be created.'),
//     },
//     outputSchema: {
//       items: z
//         .array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
//         .optional()
//         .describe('List of the created grants.'),
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data: { items: GrantDto[] }, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('create_auth_grant_bulk');
//       const headers = getHeaders({ requestInfo });

//       logger('Trying to create bulk grants...');

//       const grants = await mcp.platform.auth.grants.createBulk({ items: data.items }, { headers });
//       const fixedGrants = fixOut(grants);

//       const schemaArray = z.array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
//       const safeDataArray = schemaArray.parse(fixedGrants);

//       logger('%d grants created in bulk', safeDataArray.length);

//       return {
//         structuredContent: { items: safeDataArray },
//         content: [{ type: 'text', text: `${safeDataArray.length} Grants created successfully in bulk.` }],
//       };
//     }),
// );

// // ------------------------------------------------
// // Search & Get Authorization Grants
// // ------------------------------------------------
// mcp.server.registerTool(
//   'find_auth_grant',
//   {
//     title: 'Find Auth Grant',
//     description: `[ACTION] Fetches Authorization Grants using advanced AST filtering, pagination, and relation population.
//       [TRIGGER] Use when the user asks to list, search, or check specific permissions/grants based on criteria.
//       [RULES]
//       1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_auth_grant' instead).
//       2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
//       [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
//       [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//       [CONTEXT] MUST read "docs://schemas/core" before use.`
//       .replace(/\s+/g, ' ')
//       .trim(),
//     inputSchema: {
//       ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Nested AST query tree for advanced filtering.'),
//       projection: z.array(z.string().trim()).optional().describe(`OPTIONAL. Controls output fields.`),
//       populate: z.array(ALLOWED_POPULATES).optional().describe('OPTIONAL. Relations to join.'),
//       pagination: z
//         .object({
//           page: z.number().int().min(1).default(1),
//           limit: z.number().int().min(1).max(100).default(20),
//         })
//         .optional()
//         .describe('OPTIONAL. Pagination config. Default is page 1, limit 20.'),
//     },
//     outputSchema: {
//       items: z
//         .array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
//         .optional()
//         .describe('The list of matching grants.'),
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('find_auth_grant');
//       const headers = getHeaders({ requestInfo });

//       logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

//       const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

//       // Extract exact SDK type for payload to enforce compile-time safety
//       type FindFilterPayload = Parameters<typeof mcp.platform.auth.grants.find>[0];
//       const filterPayload: FindFilterPayload = {
//         query: mongoQuery,
//         projection: data.projection as FindFilterPayload['projection'],
//         populate: data.populate as FindFilterPayload['populate'],
//         pagination: data.pagination as FindFilterPayload['pagination'],
//       };

//       const grantsArray = await mcp.platform.auth.grants.find(filterPayload, { headers });

//       logger('=== 2. RAW DB OUTPUT === : %j', grantsArray);

//       const schemaArray = z.array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
//       const safeDataArray = schemaArray.parse(grantsArray);

//       logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

//       return {
//         structuredContent: { items: safeDataArray },
//         content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} grants.` }],
//       };
//     }),
// );

// // ------------------------------------------------
// // Delete Authorization Grant By Id
// // ------------------------------------------------
// mcp.server.registerTool(
//   'delete_auth_grant_by_id',
//   {
//     title: 'Delete Auth Grant By Id',
//     description: `[ACTION] Soft-deletes an Authorization Grant by its exact MongoDB ObjectId.
//       [TRIGGER] Use ONLY when the user explicitly asks to remove, revoke, or delete a specific grant/permission.
//       [RULES]
//       1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
//       2. CHAINING: If the exact ID is unknown (e.g., "Delete Ali's grant"), you MUST use 'find_auth_grant' first to retrieve the correct exact ID.
//       [WARNING] DESTRUCTIVE ACTION: Make sure you have the correct ID before executing.
//       [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//       [CONTEXT] MUST read "docs://schemas/core" before use.`
//       .replace(/\s+/g, ' ')
//       .trim(),
//     inputSchema: {
//       id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the grant. Do not guess.'),
//       ref: z
//         .string()
//         .trim()
//         .optional()
//         .describe('OPTIONAL. External reference identity (query parameter).Leave empty unless explicitly requested.'),
//     },
//     outputSchema: {
//       ...GRANT_OUTPUT_SCHEMA_FIELDS,
//       ...CORE_OUTPUT_SCHEMA_FIELDS,
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('delete_auth_grant_by_id');
//       const headers = getHeaders({ requestInfo });

//       logger('=== 1. LLM INPUT === : %j', data);

//       // Extract exact SDK type for payload to enforce compile-time safety
//       type DeleteConfig = Parameters<typeof mcp.platform.auth.grants.deleteById>[1];
//       const config: DeleteConfig = {
//         headers,
//         ...(data.ref && { params: { ref: data.ref } }),
//       };

//       const deletedGrant = await mcp.platform.auth.grants.deleteById(data.id, config);

//       logger('=== 2. RAW DB OUTPUT === : %j', deletedGrant);

//       // const actualData = (response as any)?.data || response;
//       const fixedDeletedGrant = fixOut(deletedGrant);

//       const schema = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
//       const safeData = schema.parse(fixedDeletedGrant);

//       logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

//       return {
//         structuredContent: safeData,
//         content: [
//           {
//             type: 'text',
//             text: `Grant with ID "${safeData.id}" (Subject: ${safeData.subject || 'Unknown'}) was deleted.`,
//           },
//         ],
//       };
//     }),
// );

// // ------------------------------------------------
// // Find Authorization Grant By Id
// // ------------------------------------------------
// mcp.server.registerTool(
//   'find_auth_grant_by_id',
//   {
//     title: 'Find Auth Grant By Id',
//     description:
//       `[ACTION] Retrieves the complete, detailed record of a specific Authorization Grant using its exact MongoDB ObjectId or external reference (ref).
//       [TRIGGER] Use when the user provides an exact ID or asks for full details of a specific grant identified in a previous step.
//       [RULES]
//       1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
//       2. CHAINING: If searching by subject, email, or action, use 'find_auth_grant' first to extract the correct ID, THEN call this tool.
//       [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//       [CONTEXT] MUST read "docs://schemas/core" before use.`
//         .replace(/\s+/g, ' ')
//         .trim(),
//     inputSchema: {
//       id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB OjectId to find. Do not guess.'),
//       ref: z
//         .string()
//         .trim()
//         .optional()
//         .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
//     },
//     outputSchema: {
//       ...GRANT_OUTPUT_SCHEMA_FIELDS,
//       ...CORE_OUTPUT_SCHEMA_FIELDS,
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('find_auth_grant_by_id');
//       const headers = getHeaders({ requestInfo });

//       logger('=== 1. LLM INPUT === : %j', data);

//       // Extract exact SDK type for payload to enforce compile-time safety
//       type FindByIdConfig = Parameters<typeof mcp.platform.auth.grants.findById>[1];
//       const config: FindByIdConfig = {
//         headers,
//         ...(data.ref && { params: { ref: data.ref } }),
//       };

//       const grant = await mcp.platform.auth.grants.findById(data.id, config);

//       logger('=== 2. RAW DB OUTPUT === : %j', grant);

//       // const actualData = (response as any)?.data || response;
//       const fixedGrant = fixOut(grant);

//       const schema = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
//       const safeData = schema.parse(fixedGrant);

//       logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

//       return {
//         structuredContent: safeData,
//         content: [{ type: 'text', text: `Grant with ID "${data.id}" was successfully found.` }],
//       };
//     }),
// );

// // ------------------------------------------------
// // Restore Auth Grant By Id
// // ------------------------------------------------
// mcp.server.registerTool(
//   'restore_auth_grant_by_id',
//   {
//     title: 'Restore Auth Grant By Id',
//     description: `[ACTION] Restores (un-deletes) a previously soft-deleted Authorization Grant by its exact MongoDB ObjectId.
//       [TRIGGER] Use ONLY when the user explicitly asks to restore, recover, reactivate, or undelete a specific grant/permission.
//       [RULES]
//       1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
//       2. CHAINING: If the exact ID is unknown (e.g., "Restore example's grant"), you MUST use 'find_auth_grant'
//       (with appropriate filters for deleted items) first to retrieve the correct exact ID.
//       [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//       [CONTEXT] MUST read "docs://schemas/core" before use.`
//       .replace(/\s+/g, ' ')
//       .trim(),
//     inputSchema: {
//       id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the grant. Do not guess.'),
//       ref: z
//         .string()
//         .trim()
//         .optional()
//         .describe('OPTIONAL. External reference identity (query parameter).Leave empty unless explicitly requested.'),
//     },
//     outputSchema: {
//       ...GRANT_OUTPUT_SCHEMA_FIELDS,
//       ...CORE_OUTPUT_SCHEMA_FIELDS,
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('restore_auth_grant_by_id');
//       const headers = getHeaders({ requestInfo });

//       logger('=== 1. LLM INPUT === : %j', data);

//       type RestoreConfig = Parameters<typeof mcp.platform.auth.grants.restoreById>[1];
//       const config: RestoreConfig = {
//         headers,
//         ...(data.ref && { params: { ref: data.ref } }),
//       };

//       const restoreGrant = await mcp.platform.auth.grants.restoreById(data.id, config);

//       logger('=== 2. RAW DB OUTPUT === : %j', restoreGrant);

//       const fixedRestoreGrant = fixOut(restoreGrant);

//       const schema = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
//       const safeData = schema.parse(fixedRestoreGrant);

//       logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

//       return {
//         structuredContent: safeData,
//         content: [
//           {
//             type: 'text',
//             text: `Grant with ID ${safeData.id} (Subject: ${safeData.subject || 'Unknown'}) was restored.`,
//           },
//         ],
//       };
//     }),
// );

// // ------------------------------------------------
// // Destroy Auth Grant By Id
// // ------------------------------------------------
// mcp.server.registerTool(
//   'destroy_auth_grant_by_id',
//   {
//     title: 'Destroy Auth Grant By Id',
//     description: `[ACTION] Permanently destroys (hard-deletes) an Authorization Grant by its exact MongoDB ObjectId.
//       [TRIGGER] Use ONLY when the user explicitly asks to "permanently delete", "destroy", "purge", or "completely remove" a grant.
//       [RULES]
//       1. CONFIRMATION REQUIRED: NEVER execute this tool immediately. First, explain to the user that this action is IRREVERSIBLE,
//           show them the Grant ID/Subject, and ask for their explicit confirmation (e.g., "Are you absolutely sure?").
//           ONLY call this tool AFTER the user replies "yes".
//       2. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
//       3. CHAINING: If the exact ID is unknown, MUST use 'find_auth_grant' first to retrieve it.
//       [WARNING] IRREVERSIBLE ACTION: This permanently removes the record from the database. It CANNOT be restored.
//       [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//       [CONTEXT] MUST read "docs://schemas/core" before use.`
//       .replace(/\s+/g, ' ')
//       .trim(),
//     inputSchema: {
//       id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the grant. Do not guess.'),
//       ref: z
//         .string()
//         .trim()
//         .optional()
//         .describe('OPTIONAL. External reference identity (query parameter).Leave empty unless explicitly requested.'),
//       // to force the LLM's behavior via MCP!
//       verification_code: z
//         .string()
//         .trim()
//         .optional()
//         .describe(
//           `CRITICAL: MUST be exactly 'CONFIRM_DESTROY'.
//           If the user's prompt DOES NOT contain the exact phrase 'CONFIRM_DESTROY', you MUST leave this field empty. Do NOT auto-fill or guess this.`,
//         ),
//     },
//     outputSchema: {
//       ...GRANT_OUTPUT_SCHEMA_FIELDS,
//       ...CORE_OUTPUT_SCHEMA_FIELDS,
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('destroy_auth_grant_by_id');
//       const headers = getHeaders({ requestInfo });

//       logger('=== 1. LLM INPUT === : %j', data);

//       if (data.verification_code !== 'CONFIRM_DESTROY') {
//         logger('=== BLOCKED: Waiting for User Confirmation ===');

//         const blockedPayload = {
//           status: 'BLOCKED_AWAITING_CONFIRMATION' as const,
//           message: 'Security Gate: User confirmation required.',
//         };

//         return {
//           structuredContent: blockedPayload,
//           content: [
//             {
//               type: 'text',
//               text: ` SYSTEM SECURITY GATE: Execution BLOCKED.
//                     You MUST STOP and ask the user this exact question right now:
//                     "WARNING: You are about to PERMANENTLY destroy this grant.
//                     This action cannot be undone and the data will be lost forever.
//                     To proceed, please reply with the exact phrase: CONFIRM_DESTROY"`,
//             },
//           ],
//         };
//       }

//       logger('=== UNLOCKED: Executing Destruction ===');
//       type DestroyConfig = Parameters<typeof mcp.platform.auth.grants.destroyById>[1];
//       const config: DestroyConfig = {
//         headers,
//         ...(data.ref && { params: { ref: data.ref } }),
//       };

//       const destroyGrant = await mcp.platform.auth.grants.destroyById(data.id, config);

//       logger('=== 2. RAW DB OUTPUT === : %j', destroyGrant);

//       const fixedDestroyGrant = fixOut(destroyGrant);

//       const schema = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
//       const safeData = schema.parse(fixedDestroyGrant);

//       return {
//         structuredContent: safeData,
//         content: [
//           {
//             type: 'text',
//             text: `Grant with ID ${safeData.id} (Subject: ${safeData.subject || 'Unknown'}) was destroyed.`,
//           },
//         ],
//       };
//     }),
// );

// // ------------------------------------------------
// // Update Auth Grant By Id
// // ------------------------------------------------
// mcp.server.registerTool(
//   'update_auth_grant_by_id',
//   {
//     title: 'Update Auth Grant By Id',
//     description: `[ACTION] Updates (patches) an existing Authorization Grant by its exact MongoDB ObjectId.
//       [TRIGGER] Use ONLY when the user explicitly asks to update, modify, edit, or change an existing permission/grant.
//       [RULES]
//       1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
//       2. CHAINING: If the exact ID is unknown (e.g., "Update Ali's grant"), you MUST use 'find_auth_grant' first to retrieve it.
//       3. PARTIAL UPDATE: Only provide the fields that actually need to be changed. Leave other fields empty.
//       [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
//       [CONTEXT] MUST read "docs://schemas/core" before use.`
//       .replace(/\s+/g, ' ')
//       .trim(),

//     inputSchema: {
//       id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the grant to update. Do not guess.'),
//       // Merge Create schemas and make every field OPTIONAL for patching
//       ...z
//         .object({
//           ...GRANT_INPUT_SCHEMA_FIELDS,
//           ...CORE_INPUT_SCHEMA_FIELDS,
//         })
//         .partial().shape,
//     },

//     outputSchema: {
//       ...GRANT_OUTPUT_SCHEMA_FIELDS,
//       ...CORE_OUTPUT_SCHEMA_FIELDS,
//       // Error response fields (returned by throwableToolCall on failure)
//       status: z.any().optional(),
//       data: z.any().optional(),
//       message: z.string().optional(),
//     },
//   },
//   async (data, { requestInfo }) =>
//     throwableToolCall(async () => {
//       const logger = mcp.log('update_auth_grant_by_id');
//       const headers = getHeaders({ requestInfo });

//       logger('=== 1. LLM INPUT === : %j', data);

//       // Separate 'id' and 'ref' from the actual update payload
//       const { id, ref, ...updatePayload } = data;

//       // Extract exact SDK type for config to enforce compile-time safety
//       type UpdateByIdConfig = Parameters<typeof mcp.platform.auth.grants.updateById>[2];
//       const config: UpdateByIdConfig = {
//         headers,
//         ...(ref && { params: { ref } }),
//       };

//       // Using 'as' here is safe because Zod has already validated the shape of the payload
//       type UpdateByIdData = Parameters<typeof mcp.platform.auth.grants.updateById>[1];
//       const safePayload = updatePayload as UpdateByIdData;

//       logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

//       const updatedGrant = await mcp.platform.auth.grants.updateById(id, safePayload, config);

//       logger('=== 3. RAW DB OUTPUT === : %j', updatedGrant);

//       const fixedUpdatedGrant = fixOut(updatedGrant);
//       const Schema = z.object({
//         ...GRANT_OUTPUT_SCHEMA_FIELDS,
//         ...CORE_OUTPUT_SCHEMA_FIELDS,
//       });
//       const safeData = Schema.parse(fixedUpdatedGrant);

//       logger('=== 4. FINAL MCP RESPONSE === : %j', safeData);

//       return {
//         structuredContent: safeData,
//         content: [
//           {
//             type: 'text',
//             text: `Grant with ID "${id}" was successfully updated.`,
//           },
//         ],
//       };
//     }),
// );
