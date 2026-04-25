import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { GRANT_INPUT_SCHEMA_FIELDS, GRANT_OUTPUT_SCHEMA_FIELDS, GRANT_DATA_DICTIONARY } from '../grants.schemas';
import { GrantDto } from '@app/common/interfaces/auth';
import { fixOut } from '@app/common/core/utils/mongo';
import { z } from 'zod';

export const registerCreateAuthGrantsTool = (mcp: ReturnType<typeof ServerMCP.create>) => {
  mcp.server.registerTool(
    'create_auth_grants',
    {
      title: 'Create a New Auth Grant',
      description: `[ACTION] Creates a single new Authorization Grant.
          [TRIGGER] Use when the user explicitly asks to create, add, or assign a new permission/grant to a user.
          [RULES]
          1. ACCURACY: Ensure all REQUIRED fields (subject, action, object) are provided.
          [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${GRANT_DATA_DICTIONARY}
          [CONTEXT] MUST read "docs://core/specification" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
      inputSchema: {
        body: z
          .object({
            ...GRANT_INPUT_SCHEMA_FIELDS,
            ...CORE_INPUT_SCHEMA_FIELDS,
          })
          .describe('Resource data for Create operation'),
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
        const logger = mcp.log('create_auth_grants');
        const headers = getHeaders({ requestInfo });

        logger('Trying to create grant...');
        const payload = data.body as GrantDto;
        const grant = await mcp.platform.auth.grants.create(payload, { headers });
        const fixedGrant = fixOut(grant);

        const schema = z.object({ ...GRANT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
        const safeData = schema.parse(fixedGrant);

        logger('A new grant created with ID: %s', safeData.id);

        return {
          structuredContent: safeData,
          content: [{ type: 'text', text: `Grant for subject "${safeData.subject}" created successfully with ID: ${safeData.id}` }],
        };
      }),
  );
};
