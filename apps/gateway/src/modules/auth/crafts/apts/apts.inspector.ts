import { serializeException, toJSON } from '@app/common/core/utils';
import { getHeaders, ServerMCP } from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { AxiosError } from 'axios';
import { z } from 'zod';

export async function mcpRegistration() {
  const mcp = ServerMCP.create();

  // TODO function to convert Date to Timestamp for LLM

  mcp.server.registerTool(
    'create_auth_apt',
    {
      title: 'Add a new apt',
      description: `Creates a new authorixation apt.
            IMPORTANT: Befor using this tool, you MUST undrestand the Wenex Access Model.
            if you haven't read it yet, READ the resource at: 'resource://docs/schemas/core' to avoid permissin errors.`,
      inputSchema: {
        name: z.string().trim().min(1, 'name is required').describe('Name for apt token'),

        expires_at: z
          .number()
          .int()
          .min(1000000000000, 'expires_at must be a valid timestamp (ms)')
          .max(9999999999999, 'expires_at is too large')
          .refine((val) => val > Date.now(), {
            message: 'expires_at must be in the future',
          })
          .describe('Expiration timestamp in milliseconds (must be future time)'),
      },
    },
    async (data, { signal, requestInfo }) => {
      if (signal.aborted) throw new Error('tools/call was cancelled');

      const headers = getHeaders({ requestInfo });
      if (!headers.authorizaton) {
        return { content: [{ type: 'text', text: 'authorization token not found' }] };
      }

      try {
        mcp.log('create_auth_apt')('Trying to create apt...');
        const apt = await mcp.platform.auth.apts.create(data, { headers });
        mcp.log('create_auth_apt')('apt created with result: %o', apt);
        return {
          structuredContent: fixOut(apt),
          content: [{ type: 'text', text: 'apt ceated successfully' }],
        };
      } catch (error) {
        const { response } = error as AxiosError;
        const structuredContent = toJSON(serializeException(response));
        mcp.log('create_auth_apt')('apt failed with error: %o', structuredContent);
        return {
          isError: true,
          structuredContent: structuredContent,
          content: [{ type: 'text', text: 'look at the structured content' }],
        };
      }
    },
  );
  await Promise.resolve();
}
