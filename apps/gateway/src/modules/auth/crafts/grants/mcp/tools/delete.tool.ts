import { CORE_OUTPUT_SCHEMA_FIELDS, CORE_DATA_DICTIONARY, getHeaders, ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { GRANT_OUTPUT_SCHEMA_FIELDS, GRANT_DATA_DICTIONARY } from '../grants.schemas';
import { fixOut } from '@app/common/core/utils/mongo';
import { z } from 'zod';

export const registerDeleteAuthGrantByIdTool = (mcp: ReturnType<typeof ServerMCP.create>) => {
  mcp.server.registerTool(
    'delete_auth_grant_by_id',
    {
      title: 'Delete Auth Grant By Id',
      description: `[ACTION] Soft-deletes an Authorization Grant by its exact MongoDB ObjectId.
        [TRIGGER] Use ONLY when the user explicitly asks to remove, revoke, or delete a specific grant/permission.
        [RULES]
        1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
        2. CHAINING: If the exact ID is unknown, you MUST use 'find_auth_grant' first to retrieve the correct exact ID.
        [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}`
        .replace(/\s+/g, ' ')
        .trim(),
      inputSchema: {
        id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the grant. Do not guess.'),
        ref: z.string().trim().optional().describe('OPTIONAL. External reference identity.'),
      },
      outputSchema: {
        ...GRANT_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
        status: z.any().optional(),
        data: z.any().optional(),
        message: z.string().optional(),
      },
    },
    async (data, { requestInfo }) =>
      throwableToolCall(async () => {
        const logger = mcp.log('delete_auth_grant_by_id');
        const headers = getHeaders({ requestInfo });

        logger('=== 1. LLM INPUT === : %j', data);

        // Extract exact SDK type for payload to enforce compile-time safety
        type DeleteConfig = Parameters<typeof mcp.platform.auth.grants.deleteById>[1];
        const config: DeleteConfig = {
          headers,
          ...(data.ref && { params: { ref: data.ref } }),
        };

        const deletedGrant = await mcp.platform.auth.grants.deleteById(data.id, config);
        const fixedDeletedGrant = fixOut(deletedGrant);

        const schema = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
        const safeData = schema.parse(fixedDeletedGrant);

        logger('=== 2. FINAL MCP RESPONSE === : %j', safeData);

        return {
          structuredContent: safeData,
          content: [
            {
              type: 'text',
              text: `Grant with ID "${safeData.id}" (Subject: ${safeData.subject || 'Unknown'}) was soft-deleted successfully.`,
            },
          ],
        };
      }),
  );
};
