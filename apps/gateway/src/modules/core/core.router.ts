import { ServerMCP, throwableToolCall, mcpOutputSchema } from '@app/common/core/mcp';
import { mcpDocLoader } from '@app/common/core/mcp/loader.mcp';
import { toString } from '@app/common/core/utils';
import { APP } from '@app/common/core/app';
import axios from 'axios';
import { z } from 'zod';

const { API_PORT } = APP.GATEWAY;
const HOST = process.env['GATEWAY_HOST'] || 'localhost';
const api = axios.create({ baseURL: `http://${HOST}:${API_PORT}` });

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// auth_verify
// Reads the APT from the MCP request's Authorization header,
// calls GET /auth/verify on the gateway, and returns decoded
// token values. Must be called before any resource operations.
// ------------------------------------------------------------

mcp.server.registerTool(
  'auth_verify',
  {
    title: 'Verify APT',
    description:
      'Verify the current Auth Personal Token (APT) and return its decoded values. ' +
      'Call this before using any Wenex resource tools. ' +
      'Read docs://core/auth-specification if you need help interpreting the decoded values.',
    inputSchema: {},
    outputSchema: mcpOutputSchema({ result: { token: z.any() } }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (_args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('auth_verify', requestInfo);
      logger('verifying APT token via GET /auth/verify');

      const { data } = await api.get('/auth/verify', { headers });
      logger('token verified successfully: %o', data);

      return {
        structuredContent: { result: { token: data } },
        content: [
          {
            type: 'text',
            text:
              `TOKEN DECRYPTED VALUES:\n${toString(data)}\n\n` +
              `NOTE: If you need help interpreting these values, read docs://core/auth-specification using read_documentations.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------------------
// read_documentations
// Reads any Wenex MCP documentation resource by URI.
// Supports docs://readme, docs://core/*, and docs://service/*.
// Use ?v=c for compact (default) or ?v=e for extended.
// ------------------------------------------------------------

mcp.server.registerTool(
  'read_documentations',
  {
    title: 'Read MCP Documentation',
    description:
      'Read a Wenex MCP documentation resource by URI. ' +
      'Supported URIs: docs://readme, docs://core/specification, docs://core/resource-specification, ' +
      'docs://core/auth-specification, docs://core/agent-guidance, ' +
      'docs://service/<service>-specification. ' +
      'Append ?v=c for compact (default) or ?v=e for extended.',
    inputSchema: {
      uri: z
        .string()
        .describe(
          'MCP documentation URI. Examples: "docs://readme", "docs://core/specification?v=c", ' +
            '"docs://service/identity-specification?v=e", "docs://core/agent-guidance"',
        ),
    },
    outputSchema: mcpOutputSchema({ result: { content: z.string() } }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  (args) =>
    throwableToolCall(() => {
      const [logger] = mcp.utils('read_documentations', undefined);
      logger('loading documentation for uri: %s', args.uri);

      // docs://core/specification maps to docs://core/-specification on disk
      let uri = args.uri;
      if (uri === 'docs://core/specification' || uri.startsWith('docs://core/specification?')) {
        uri = uri.replace('docs://core/specification', 'docs://core/-specification');
      }

      // docs://readme has no compact/extended variant — pass null to skip suffix
      const isReadme = uri.startsWith('docs://readme');
      const content = mcpDocLoader(uri, isReadme ? null : undefined);

      return {
        structuredContent: { result: { content } },
        content: [{ type: 'text', text: 'Look at structured data.' }],
      };
    }),
);
