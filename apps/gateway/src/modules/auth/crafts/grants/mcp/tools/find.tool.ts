import { CORE_OUTPUT_SCHEMA_FIELDS, CORE_DATA_DICTIONARY, getHeaders, ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { ROOT_QUERY_SCHEMA, buildMongoQuery, AstNode, ALLOWED_POPULATES } from '@app/common/core/mcp/ast.mcp';
import { GRANT_DATA_DICTIONARY, GRANT_OUTPUT_SCHEMA_FIELDS } from '../grants.schemas';
import { z } from 'zod';

export const registerFindAuthGrantsTool = (mcp: ReturnType<typeof ServerMCP.create>) => {
  mcp.server.registerTool(
    'find_auth_grants',
    {
      title: 'Find Auth Grants',
      description: `[ACTION] Fetches Authorization Grants using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or check specific permissions/grants based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_auth_grants' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to skip 0, limit 10.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://core/specification" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
      inputSchema: {
        filter: z
          .object({
            ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Nested AST query tree for advanced filtering.'),
            projection: z.array(z.string().trim()).optional().describe(`OPTIONAL. Controls output fields.`),
            populate: z.array(ALLOWED_POPULATES).optional().describe('OPTIONAL. Relations to join.'),
            pagination: z
              .object({
                skip: z.number().int().min(0).default(0),
                limit: z.number().int().min(1).max(100).default(10),
                sort: z.record(z.enum(['asc', 'desc'])).optional(),
              })
              .optional()
              .describe('OPTIONAL. Pagination config. Default is skip 0, limit 10.'),
          })
          .describe('Query and filter configurations'),
      },
      outputSchema: {
        items: z
          .array(z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
          .optional()
          .describe('The list of matching grants.'),
        status: z.any().optional(),
        data: z.any().optional(),
        message: z.string().optional(),
      },
    },
    async (data, { requestInfo }) =>
      throwableToolCall(async () => {
        const logger = mcp.log('find_auth_grants');
        const headers = getHeaders({ requestInfo });

        logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

        const filterArgs = data.filter || {};
        const mongoQuery = filterArgs.ast_query?.conditions?.length ? buildMongoQuery(filterArgs.ast_query as AstNode) : {};

        type FindFilterPayload = Parameters<typeof mcp.platform.auth.grants.find>[0];
        const filterPayload: FindFilterPayload = {
          query: mongoQuery,
          projection: filterArgs.projection as FindFilterPayload['projection'],
          populate: filterArgs.populate as FindFilterPayload['populate'],
          pagination: filterArgs.pagination as FindFilterPayload['pagination'],
        };

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
