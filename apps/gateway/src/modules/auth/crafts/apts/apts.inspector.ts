import { serializeException, toJSON } from '@app/common/core/utils';
import { getHeaders, ServerMCP } from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { AxiosError } from 'axios';
import { z } from 'zod';

// function to convert Date to Timestamp for LLM
function parseNaturalDate(dateStr: string) {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date format: ' + dateStr);
  }
  return parsed.getTime();
}

export function mcpRegistration() {
  const mcp = ServerMCP.create();

  mcp.server.registerTool(
    'create_auth_apt',
    {
      title: 'Add a new apt',
      description: `Creates a new authorization apt.
            IMPORTANT: Before using this tool, you MUST understand the Wenex Access Model.
            if you haven't read it yet, READ the resource at: 'resource://docs/schemas/core' to avoid permissions errors.`,
      inputSchema: {
        name: z.string().trim().min(1, 'name is required').describe('Name for apt token'),

        expires_at: z
          .union([z.number().int(), z.string().trim()])
          .describe('Expiration timestamp (ms) or natural date string (e.g., "1 Mar 2026")'),
      },
    },
    async (data, { signal, requestInfo }) => {
      if (signal.aborted) throw new Error('tools/call was cancelled');

      const headers = getHeaders({ requestInfo });
      if (!headers.authorization) {
        return { content: [{ type: 'text', text: 'authorization token not found' }] };
      }

      try {
        let expiresAtTimestamp: number;
        if (typeof data.expires_at === 'string') {
          expiresAtTimestamp = parseNaturalDate(data.expires_at);
        } else {
          expiresAtTimestamp = data.expires_at;
        }

        mcp.log('create_auth_apt')('Trying to create apt...');
        const apt = await mcp.platform.auth.apts.create({ ...data, expires_at: expiresAtTimestamp }, { headers });
        mcp.log('create_auth_apt')('apt created with result: %o', apt);
        return {
          structuredContent: fixOut(apt),
          content: [{ type: 'text', text: 'apt created successfully' }],
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
}
