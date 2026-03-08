import { CORE_INPUT_SCHEMA_FIELDS, getHeaders, ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { isCron } from '@app/common/core/decorators/validation';
import { GrantDto } from '@app/common/interfaces/auth';
import { fixOut } from '@app/common/core/utils/mongo';
import { Action, Resource } from '@app/common/core';
import { isIP, isCIDR } from 'abacl';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Creates a new Authorization Grant.
// ------------------------------------------------------------------------------------------------

const grantTimeSchema = z.object({
  cron_exp: z
    .string()
    .trim()
    .refine((val) => isCron(val), { message: 'cron_exp must be a valid cron expression' })
    .describe('Cron expression that defines when the grant becomes active.'),

  duration: z.number().positive().describe('Duration of the grant in seconds.'),
});

mcp.server.registerTool(
  'create_auth_grant',
  {
    title: 'Add a new Grant',
    description: `Creates a new Authorization Grant.
IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts.
if you haven't read it yet, READ the resource at: "docs://schemas/core" to avoid permissions errors.`,
    inputSchema: {
      subject: z.string().nonempty().email().describe('REQUIRED. User email receiving the grant.'),
      action: z.nativeEnum(Action).describe('REQUIRED. Permission action (e.g., read:share).'),
      object: z.nativeEnum(Resource).describe('REQUIRED. Target resource type.'),

      location: z
        .array(
          z
            .string()
            .trim()
            .refine((val) => isIP(val) || isCIDR(val), {
              message: 'Each location must be a valid IP address or CIDR notation',
            }),
        )
        .optional()
        .describe(
          `OPTIONAL. List of network addresses (IP/CIDR) allowed to access this resource. Leave empty if user didn't specify.`,
        ),

      // TODO: Write for `filter` and `field`
      time: z.array(grantTimeSchema).optional().describe(`Optional list of time rules defining when the grant is active.
                    Each item contains a cron schedule and duration.`),
      ...CORE_INPUT_SCHEMA_FIELDS,
    },
  },
  async (data: GrantDto, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('create_auth_grant')('Trying to create grant...');
      const grant = await mcp.platform.auth.grants.create(data, { headers });
      mcp.log('create_auth_grant')('A new grant created with result: %o', grant);
      return { structuredContent: fixOut(grant), content: [{ type: 'text', text: 'Grant created successfully.' }] };
    }),
);
