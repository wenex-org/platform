import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
} from '@app/common/core/mcp';
import { Grant, GrantTime } from '@app/common/interfaces/auth';
import { CreateGrantDto } from '@app/common/dto/auth';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const TIME_SCHEMA: Record<keyof GrantTime, ZodType> = {
  cron_exp: z.string(),
  duration: z.number().positive(),
};

type GrantSchema = Record<keyof Grant, ZodType>;

const GRANT_SCHEMA: Partial<GrantSchema> = {
  subject: z.string(),
  action: z.string(),
  object: z.string(),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z.array(z.object(TIME_SCHEMA)).optional(),
};

const GRANT_INPUT_SCHEMA: Partial<GrantSchema> = { ...GRANT_SCHEMA, ...CORE_INPUT_SCHEMA };
const GRANT_OUTPUT_SCHEMA: Partial<GrantSchema> = { ...GRANT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

mcp.server.registerTool(
  'count_auth_grants',
  {
    title: 'Count AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_auth_grants', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.auth.grants.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

mcp.server.registerTool(
  'create_auth_grants',
  {
    title: 'Create AuthGrant',
    description: `Read "docs://core/auth-specification"`,
    inputSchema: mcpInputSchema({ body: GRANT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: GRANT_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_auth_grants', requestInfo, args);

      const payload = args.body as CreateGrantDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.auth.grants.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Grant for subject "${result.subject}" created successfully.` }],
      };
    }),
);
