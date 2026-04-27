import { getHeaders, ServerMCP, throwableToolCall, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { CreateGrantDto } from '@app/common/dto/auth';
import { Action, Resource } from '@app/common/core';

import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const TIME_SCHEMA = z.object({
  cron_exp: z.string(),
  duration: z.number().positive(),
});

const GRANT_SCHEMA = {
  subject: z.string(),
  // .describe(
  //   'REQUIRED. The exact subject email as typed by the user (e.g. user@domain.com). ' +
  //   'DO NOT GUESS. DO NOT use placeholders. If not explicitly provided by the user, STOP and ask.',
  // ),
  action: z.nativeEnum(Action),
  // .describe(
  //   'REQUIRED. The exact action as typed by the user. Must be one of the enum values from Action. ' +
  //   'DO NOT GUESS. If not explicitly provided by the user, STOP and ask.',
  // ),
  object: z.nativeEnum(Resource),
  // .describe(
  //   'REQUIRED. The exact resource object as typed by the user. Must be one of the enum values from Resource. ' +
  //   'DO NOT GUESS. If not explicitly provided by the user, STOP and ask.',
  // ),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z.array(TIME_SCHEMA).optional(),
};

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

mcp.server.registerTool(
  'count_auth_grants',
  {
    title: 'Count AuthGrant',
    description: 'REQUIRED: "docs://core/auth-specification"',
    inputSchema: {
      headers: z.record(z.string(), z.string()).optional(),
      filter: z.object({}).passthrough().optional(),
    },
    outputSchema: {
      result: z.object({}).passthrough().optional(),
      errors: z.array(z.object({}).passthrough()).optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('count_auth_grants');
      const headers = getHeaders({ requestInfo });

      logger('input schema: %o', data);
      logger('request headers: %o', headers);

      const query = data.filter?.query ?? {};
      const config = { headers: { ...(data.headers ?? {}), ...headers } };
      logger('endpoint call with query %o and config %o', query, config);

      const result = await mcp.platform.auth.grants.count(query, config);
      logger('the structured content of result value after call is: %o', result);

      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

mcp.server.registerTool(
  'create_auth_grants',
  {
    title: 'Create AuthGrant',
    description: `REQUIRED: read "docs://core/auth-specification" first.
      REQUIRED: call prepare_grant_creation before this tool.
      REQUIRED: all of subject, action, and object must have been explicitly typed by the user in their message.`,
    inputSchema: {
      headers: z.record(z.string(), z.string()).optional(),
      body: z.object({ ...GRANT_SCHEMA, ...CORE_INPUT_SCHEMA }),
    },
    outputSchema: {
      errors: z.array(z.object({}).passthrough()).optional(),
      result: z.object({ ...GRANT_SCHEMA, ...CORE_OUTPUT_SCHEMA }).partial(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_auth_grant');
      const headers = getHeaders({ requestInfo });

      logger('input schema: %o', data);
      logger('request headers: %o', headers);

      const payload = data.body as CreateGrantDto;
      const config = { headers: { ...(data.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.auth.grants.create(payload, config);
      logger('the structured content of result value after call is: %o', result);

      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Grant for subject "${result.subject}" created successfully.` }],
      };
    }),
);
