import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { toDate } from '@app/common/core/utils';
import { z } from 'zod';

const mcp = ServerMCP.create();

const FullAptSchemaForParsing = z.object({
  token: z.string().optional(),
  name: z.string().optional(),
  secret: z.string().optional(),
  expires_at: z.union([z.number(), z.string()]).optional(),
  strict: z.boolean().optional(),
  cid: z.string().optional(),
  aid: z.string().optional(),
  uid: z.string().optional(),
  domain: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  tz: z.string().optional(),
  lang: z.string().optional(),
  session: z.string().optional(),
  client_id: z.string().optional(),
  coworkers: z.array(z.string()).optional(),
  ...CORE_OUTPUT_SCHEMA_FIELDS,
});

mcp.server.registerTool(
  'create_auth_apt',
  {
    title: 'Add a new APT',
    description: `Creates a new Authentication Personal Token (APT).`,
    inputSchema: {
      name: z
        .string()
        .trim()
        .min(1, 'name is required')
        .describe(
          'REQUIRED. Name for the apt token. You MUST ask the user for this. DO NOT call this tool without a real name provided by the user.',
        ),

      expires_at: z
        .string()
        .trim()
        .describe(
          'REQUIRED. Expiration date. You (the AI) MUST convert the user input into an ISO 8601 format (YYYY-MM-DD) BEFORE calling this tool. Example: If user says "10 Mar 2027", send "2027-03-10". DO NOT call this tool without a real date provided by the user.',
        ),

      ...CORE_INPUT_SCHEMA_FIELDS,
    },
    outputSchema: {
      id: z.string().describe('The unique ID of the created APT, useful for future operations.'),
      name: z.string().describe('The name of the token.'),
      token: z.string().describe('The secret token value. This should be shown to the user.'),
      expires_at: z.number().describe('The expiration timestamp of the token.'),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('create_auth_apt')('Trying to create apt...');
      const expiresAtTimestamp = toDate(data.expires_at).getTime();
      const apt = await mcp.platform.auth.apts.create({ ...data, expires_at: expiresAtTimestamp }, { headers });
      const fixedApt = fixOut(apt);
      const allSafeData = FullAptSchemaForParsing.parse(fixedApt);
      mcp.log('create_auth_apt')('A new APT created with ID: %s', allSafeData.id);
      const finalResponse = {
        id: allSafeData.id,
        name: allSafeData.name,
        token: allSafeData.token,
        expires_at: allSafeData.expires_at,
      };

      return {
        structuredContent: finalResponse,
        content: [
          {
            type: 'text',
            text: `APT token "${finalResponse.name}" created successfully. Your token is: ${finalResponse.token}`,
          },
        ],
      };
    }),
);
