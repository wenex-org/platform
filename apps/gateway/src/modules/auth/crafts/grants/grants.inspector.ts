import { serializeException, toJSON } from '@app/common/core/utils';
import { getHeaders, ServerMCP } from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { Action, Resource } from '@app/common/core';
import { AxiosError } from 'axios';
import { z } from 'zod';

export function mcpRegistration() {
  const mcp = ServerMCP.create();
  mcp.server.registerTool(
    'create_auth_grant',
    {
      title: 'Add a new Grant',
      description: 'Create a new grant with subject, action and object',
      inputSchema: {
        subject: z.string().nonempty().email(),
        action: z.nativeEnum(Action),
        object: z.nativeEnum(Resource),
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
}
