import { getHeaders, ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { toDate } from '@app/common/core/utils';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Creates a new Authentication Personal Token (APT).
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'create_auth_apt',
  {
    title: 'Add a new APT',
    description: `Creates a new Authentication Personal Token (APT).`,
    inputSchema: {
      name: z
        .string()
        .trim()
        .min(1, 'name is required')
        .describe(
          'REQUIRED. Name for the apt token. You MUST ask the user for this. DO NOT call this tool without a real name provided by the user.',
        ),

      expires_at: z
        .string()
        .trim()
        .describe(
          'REQUIRED. Expiration date. You (the AI) MUST convert the user input into an ISO 8601 format (YYYY-MM-DD) BEFORE calling this tool. Example: If user says "10 Mar 2027", send "2027-03-10". DO NOT call this tool without a real date provided by the user.',
        ),
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
