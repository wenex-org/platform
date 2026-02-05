import { getHeaders, ServerMCP } from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { Action, Resource } from '@app/common/core';
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
      const log = mcp.log.extend('create_auth_grant');

      if (signal.aborted) throw new Error('tools/call was cancelled');

      const headers = getHeaders({ requestInfo });
      if (!headers.authorization) {
        return { content: [{ type: 'text', text: 'authorization token not found' }] };
      }

      log('Trying to create grant...');
      const grant = await mcp.platform.auth.grants.create(data, { headers });
      log('Grant created with result: %o', grant);

      return {
        content: [{ type: 'resource', mimeType: 'application/json', resource: fixOut(grant) }],
      };
    },
  );
}
