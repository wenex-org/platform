import { getHeaders, ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { toDate } from '@app/common/core/utils';
import { z } from 'zod';

export function mcpRegistration() {
  const mcp = ServerMCP.create();

  mcp.server.registerTool(
    'create_auth_apt',
    {
      title: 'Add a new APT',
      description: `Creates a new Authentication Personal Token (APT).
IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts.
if you haven't read it yet, READ the resource at: "docs://schemas/core" to avoid permissions errors.`,
      inputSchema: {
        name: z.string().trim().min(1, 'name is required').describe('Name for apt token'),

        expires_at: z
          .union([z.number().int(), z.string().trim()])
          .describe('Expiration timestamp (ms) or natural date string (e.g., "1 Mar 2026")'),
      },
    },
    async (data, { requestInfo }) =>
      throwableToolCall(async () => {
        const headers = getHeaders({ requestInfo });
        mcp.log('create_auth_apt')('Trying to create apt...');
        const expiresAtTimestamp = toDate(data.expires_at).getTime();
        const apt = await mcp.platform.auth.apts.create({ ...data, expires_at: expiresAtTimestamp }, { headers });
        mcp.log('create_auth_apt')('A new APT created with result: %o', apt);
        return {
          structuredContent: fixOut(apt),
          content: [{ type: 'text', text: 'apt created successfully' }],
        };
      }),
  );
}
