import { ServerMCP } from '@app/common/core/mcp';
import { QUERY_DECS } from '@app/common/core/mcp/descs.mcp';
import { toString } from '@app/common/core/utils';

export async function mcpRegistration() {
  const mcp = ServerMCP.create();
  const { ResourceTemplate } = await import('@modelcontextprotocol/sdk/server/mcp.js');

  mcp.server.registerResource(
    'countAuthGrant',
    new ResourceTemplate('auth://grants/count{?query}', {
      list: () => ({
        resources: [],
      }),
    }),
    {
      title: 'Application Config',
      description: `Application configuration data query="${QUERY_DECS}"`,
    },
    (uri, extra) => {
      console.log('uri', uri, 'extra', extra);
      const queryParam = uri.searchParams.get('query');
      console.log(queryParam);

      return {
        contents: [
          {
            uri: uri.href,
            text: toString({}),
            mimeType: 'application/json',
          },
        ],
      };
    },
  );
}
