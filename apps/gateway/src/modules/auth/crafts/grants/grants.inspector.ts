import { serializeException, toJSON } from '@app/common/core/utils';
import { getHeaders, ServerMCP } from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { Action, Resource } from '@app/common/core';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { loadMarkdownFile } from 'tool-description-loader';

export async function mcpRegistration() {
  const mcp = ServerMCP.create();

  mcp.server.registerResource(
    'core-docs',
    'resource://docs/schemas/core',
    {
      mimeType: 'text/markdown',
      description: 'Wenex Core Interface Documentation & Access Rules',
    },
    async (uri) => {
      const coreDocs = await loadMarkdownFile('schemas/core.md');
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: coreDocs,
          },
        ],
      };
    },
  );

  mcp.server.registerTool(
    'create_auth_grant',
    {
      title: 'Add a new Grant',
      description: `Creates a new authorization grant. 
                    IMPORTANT: Before using this tool, you MUST understand the Wenex Access Model. 
                    If you haven't read it yet, READ the resource at: 'resource://docs/schemas/core' to avoid permission errors.`,
      inputSchema: {
        subject: z.string().nonempty().email().describe('User email receiving the grant'),
        action: z.nativeEnum(Action).describe('Permission action (e.g., read:share)'),
        object: z.nativeEnum(Resource).describe('Target resource type'),
      },
    },
    async (data, { signal, requestInfo }) => {
      if (signal.aborted) throw new Error('tools/call was cancelled');

      const headers = getHeaders({ requestInfo });
      if (!headers.authorization) {
        return { content: [{ type: 'text', text: 'authorization token not found' }] };
      }

      try {
        mcp.log('create_auth_grant')('Trying to create grant...');
        const grant = await mcp.platform.auth.grants.create(data, { headers });
        mcp.log('create_auth_grant')('Grant created with result: %o', grant);
        return {
          structuredContent: fixOut(grant),
          content: [{ type: 'text', text: 'Grant created successfully' }],
        };
      } catch (error) {
        const { response } = error as AxiosError;
        const structuredContent = toJSON(serializeException(response));
        mcp.log('create_auth_grant')('Grant failed with error: %o', structuredContent);
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
