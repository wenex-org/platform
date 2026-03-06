import { getHeaders, ServerMCP, throwableToolCall } from '@app/common/core/mcp';
import { GrantDto } from '@app/common/interfaces/auth';
import { fixOut } from '@app/common/core/utils/mongo';
import { Action, Resource } from '@app/common/core';
import { isMongoId } from 'class-validator';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Creates a new Authorization Grant.
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'create_auth_grant',
  {
    title: 'Add a new Grant',
    description: `Creates a new Authorization Grant.
IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts.
if you haven't read it yet, READ the resource at: "docs://schemas/core" to avoid permissions errors.`,
    inputSchema: {
      subject: z.string().nonempty().email().describe('User email receiving the grant'),
      action: z.nativeEnum(Action).describe('Permission action (e.g., read:share)'),
      object: z.nativeEnum(Resource).describe('Target resource type'),

      ref: z
        .string()
        .optional()
        .transform((val) => val?.trim()).describe(`Optional external reference or business key used
                                                    for integration with external systems, legacy databases,
                                                    or internal cross-linking between Wenex entities/services.`),
      owner: z
        .string()
        .optional()
        .refine((val) => isMongoId(val), { message: 'Invalid MongoId' })
        .describe('User ID who owns the record'),
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
