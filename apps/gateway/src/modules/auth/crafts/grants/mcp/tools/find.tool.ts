import { CORE_OUTPUT_SCHEMA_FIELDS, CORE_DATA_DICTIONARY, getHeaders, ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { ROOT_QUERY_SCHEMA, buildMongoQuery, AstNode, ALLOWED_POPULATES } from '@app/common/core/mcp/ast.mcp';
import { GRANT_DATA_DICTIONARY, GRANT_OUTPUT_SCHEMA_FIELDS } from '../grants.schemas';
import { z } from 'zod';

export const registerFindAuthGrantTool = (mcp: ReturnType<typeof ServerMCP.create>) => {
  mcp.server.registerTool(
    'find_auth_grant',
    {
      title: 'Find Auth Grant',
      description: `[ACTION] Fetches Authorization Grants using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or check specific permissions/grants based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_auth_grant' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
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
          .array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
          .optional()
          .describe('The list of matching grants.'),
        // Error response fields (returned by throwableToolCall on failure)
        status: z.any().optional(),
        data: z.any().optional(),
        message: z.string().optional(),
      },
    },
    async (data, { requestInfo }) =>
      throwableToolCall(async () => {
        const logger = mcp.log('find_auth_grant');
        const headers = getHeaders({ requestInfo });

        logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

        const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

        // Extract exact SDK type for payload to enforce compile-time safety
        type FindFilterPayload = Parameters<typeof mcp.platform.auth.grants.find>[0];
        const filterPayload: FindFilterPayload = {
          query: mongoQuery,
          projection: data.projection as FindFilterPayload['projection'],
          populate: data.populate as FindFilterPayload['populate'],
          pagination: data.pagination as FindFilterPayload['pagination'],
        };
        // TODO: FIND FOR SOFT DELETED
        const grantsArray = await mcp.platform.auth.grants.find(filterPayload, { headers });

        logger('=== 2. RAW DB OUTPUT === : %j', grantsArray);

        const schemaArray = z.array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
        const safeDataArray = schemaArray.parse(grantsArray);

        logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

        return {
          structuredContent: { items: safeDataArray },
          content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} grants.` }],
        };
      }),
  );
};
