import { getHeaders, ServerMCP } from '@app/common/core/mcp';
import { GrantDto } from '@app/common/interfaces/auth';
import { Action, Resource } from '@app/common/core';
import { z } from 'zod';

export function mcpRegistration() {
  const mcp = ServerMCP.create();
  mcp.server.registerTool(
    'add_grant',
    {
      title: 'Add Grant',
      description: 'Create a new grant with subject, action and object',
      inputSchema: {
        subject: z.string().nonempty().email(),
        action: z.nativeEnum(Action),
        object: z.nativeEnum(Resource),
      },
      // outputSchema: {
      //   id: z.string().nonempty(),
      // },
    },
    async ({ subject, action, object }, { signal, requestInfo }) => {
      if (signal.aborted) {
        throw new Error('tools/call was cancelled');
      }

      const headers = getHeaders({ requestInfo } as any);
      const authorizationValue = headers.authorization ?? headers.Authorization;
      const authorization = typeof authorizationValue === 'string' ? authorizationValue : undefined;

      if (!authorization) {
        return {
          content: [
            {
              type: 'text',
              text: 'authorization not found',
            },
          ],
        };
      }

      const data: GrantDto = {
        subject,
        action,
        object,
      };

      console.log('Trying to create grant...');
      const grant = await mcp.platform.auth.grants.create(data, {
        headers,
        brotli: false,
      });
      console.log('Grant created:', grant);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(grant),
          },
        ],
        structuredContent: grant as any,
      };
    },
  );
}
