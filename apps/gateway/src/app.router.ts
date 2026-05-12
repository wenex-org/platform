import { ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { mcpDocLoader } from '@app/common/core/mcp/loader.mcp';
import { toString } from '@app/common/core/utils';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// auth_verify
// ------------------------------------------------------------

mcp.server.registerTool(
  'auth_verify',
  {
    title: 'Verify APT',
    description:
      'Verify the current Auth Personal Token (APT) and return its decoded values. ' +
      'CALL THIS FIRST — before any resource tool. Call once per session.\n\n' +
      'Decoded token fields:\n' +
      '  subject   — the authenticated identity (format: domain::type::ref)\n' +
      '  scope     — space-separated list of granted scopes\n' +
      '  zone      — data visibility zone (own | share | client | broad)\n' +
      '  exp       — Unix expiry timestamp\n' +
      '  client_id — the issuing OAuth client\n\n' +
      'On success: use the returned subject and zone in subsequent tool calls.\n' +
      'On 401: the token is missing, expired, or malformed — ask the user for a valid APT.\n' +
      'On 403: valid token but insufficient scope/grant — ' +
      'call read_documentations with uri="docs://core/auth-specification?v=e" to diagnose.',
    inputSchema: { headers: z.record(z.string(), z.string()).optional() },
    outputSchema: { errors: z.array(z.any()).optional(), result: z.object({ token: z.any() }) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall('auth_verify', async () => {
      const [logger, headers] = mcp.utils('auth_verify', requestInfo, args);
      logger('platform endpoint calling with headers %o', headers);

      const token = await mcp.platform.auth.auths.verify({ headers });
      logger('authorization bearer token verified successfully: %o', token);
      return {
        structuredContent: { result: { token: token } },
        content: [
          {
            type: 'text',
            text:
              `TOKEN DECRYPTED VALUES:\n${toString(token)}\n\n` +
              `NOTE: If you need help interpreting these values, read docs://core/auth-specification using read_documentations.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------------------
// read_documentations
// ------------------------------------------------------------

mcp.server.registerTool(
  'read_documentations',
  {
    title: 'Read MCP Documentation',
    description:
      'Read a Wenex MCP documentation resource by URI. Use this to learn the platform before calling any resource tool.\n\n' +
      'MINIMUM STARTUP SEQUENCE:\n' +
      '  1. docs://core/specification        — operations, headers, filters, pagination, zones\n' +
      '  2. docs://core/resource-specification — service and collection catalog\n' +
      '  3. docs://core/auth-specification    — APTs, scopes, grants, 401/403 (load when auth matters)\n\n' +
      'CORE DOCUMENTS:\n' +
      '  docs://readme                        — routing entrypoint, load order rules\n' +
      '  docs://core/specification            — canonical MCP rules and metadata headers\n' +
      '  docs://core/resource-specification   — all services and collections\n' +
      '  docs://core/auth-specification       — APTs, scopes, grants, subjects, zones\n' +
      '  docs://core/agent-guidance           — MongoDB query patterns and Mermaid diagram guide\n' +
      '  docs://core/cross-service-pattern    — multi-service workflow patterns\n\n' +
      'SERVICE DOCUMENTS (load on-demand after mapping user intent):\n' +
      '  docs://service/identity-specification  — users, profiles, sessions\n' +
      '  docs://service/financial-specification — accounts, wallets, invoices, transactions\n' +
      '  docs://service/essential-specification — sagas, saga stages, orchestration\n' +
      '  docs://service/general-specification   — activities, artifacts, comments, events, workflows\n' +
      '  docs://service/special-specification   — files, uploads, share links, stats\n' +
      '  docs://service/domain-specification    — clients, apps, scopes\n' +
      '  docs://service/content-specification   — notes, posts, tickets\n' +
      '  docs://service/context-specification   — configs, settings, RBAC\n' +
      '  docs://service/touch-specification     — emails, notices, pushes, SMS\n' +
      '  docs://service/conjoint-specification  — messaging, channels, contacts\n' +
      '  docs://service/career-specification    — businesses, branches, employees, products\n' +
      '  docs://service/logistic-specification  — locations, drivers, vehicles, travels\n' +
      '  docs://service/thing-specification     — devices, sensors, metrics, telemetry\n\n' +
      'VERSION: append ?v=c (compact, default) or ?v=e (extended — for troubleshooting, onboarding, complex filters).\n' +
      'ESCALATE to extended when: 401/403 diagnosis, complex MongoDB queries, schema authoring, saga reasoning, or any ambiguity.',
    inputSchema: {
      headers: z.record(z.string(), z.string()).optional(),
      body: z.object({
        uri: z
          .string()
          .describe(
            'MCP documentation URI. Examples: "docs://readme", "docs://core/specification?v=c", ' +
              '"docs://service/identity-specification?v=e", "docs://core/agent-guidance"',
          ),
      }),
    },
    outputSchema: { errors: z.array(z.any()).optional(), result: z.object({ content: z.string() }) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  (args, { requestInfo }) =>
    throwableToolCall('read_documentations', () => {
      const [logger, headers] = mcp.utils('read_documentations', requestInfo, args);
      logger('platform endpoint calling with headers %o', headers);

      // docs://core/specification maps to docs://core/-specification on disk
      let uri = args.body?.uri;
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
