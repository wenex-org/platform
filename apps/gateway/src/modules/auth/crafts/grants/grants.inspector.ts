import { ServerMCP } from '@app/common/core/mcp';
import { z } from 'zod';

export function mcpRegistration() {
  const mcp = ServerMCP.create();

  // count
  mcp.server.registerResource(
    'countAuthGrant',
    'auth://grants/count',
    {
      title: 'Application Config',
      description: 'Application configuration data',
      _meta: {
        filter: z.object({}).describe('Json mongodb query'),
      },
    },
    (uri, extra) => {
      console.log('uri', uri, 'extra', extra);
      return {
        contents: [
          {
            uri: uri.href,
            text: 'App configuration here',
          },
        ],
      };
    },
  );
}
