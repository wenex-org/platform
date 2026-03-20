import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { fixOut } from '@app/common/core/utils/mongo';
import { toDate } from '@app/common/core/utils';
import { Scope } from '@app/common/core';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const APT_INPUT_SCHEMA_FIELDS = {
  name: z.string().trim().min(1, 'name is required').describe(`REQUIRED. Name for the apt token. You MUST ask the user for this.
                DO NOT call this tool without a real name provided by the user.`),

  expires_at: z.string().trim().describe(`REQUIRED. Expiration date. You (the AI) MUST convert the user input into
      an ISO 8601 format (YYYY-MM-DD) BEFORE calling this tool.
      Example: If user says "10 Mar 2027", send "2027-03-10".
      DO NOT call this tool without a real date provided by the user.`),

  strict: z.boolean().optional().describe(''), // TODO: WRITE BY [VAHID]

  scopes: z
    .array(z.nativeEnum(Scope))
    .nonempty()
    .transform((arr) => [...new Set(arr)]).describe(`REQUIRED. Array of permission scopes granted to this apt.
                Each scope specifies what actions the apt can perform on which resources.
                Format: "<action>:<resource>[:<sub-resource>]".
                Example scopes: "read:identity:users", "write:content:posts".
                Always include the minimum scopes required for the apt functionality.
                Duplicate scopes will be automatically removed.
                If scopes are not provided, DO NOT call this tool and ask the user to specify them.`),

  // RECHECK: IT HAS OPTIONAL AND NOTEMPTY AS A SAME TIME IN DTO
  // BUT IN HERE IT HAS JUST OPTIONAL
  subjects: z
    .array(z.string().trim())
    .transform((arr) => [...new Set(arr)])
    .optional().describe(`OPTIONAL. Target entities this token can act upon.
          Leave empty if not explicitly mentioned by the user.`),

  // RECHECK: IT HAS OPTIONAL AND NOTEMPTY AS A SAME TIME IN DTO
  // BUT IN HERE IT HAS JUST OPTIONAL
  coworkers: z
    .array(z.string().trim())
    .transform((arr) => [...new Set(arr)])
    .optional().describe(`OPTIONAL. Team members allowed to manage/revoke this token.
          Leave empty if not explicitly mentioned by the user.`),

  // ASK: NEED TO DEFINE  tz and lang?
  // tz: z
  //   .string()
  //   .trim()
  //   .refine((val) => isTimeZone(val), { message: 'Invalid Timezone' })
  //   .optional()
  //   .describe(''),

  // lang: z
  //   .string()
  //   .trim()
  //   .refine((val) => isLocale(val), { message: 'Invalid Local' })
  //   .optional()
  //   .describe(''),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------

// RECHECK: CHECK ALL DESCRIBE (CID, AID, UID) [VAHID]
const APT_OUTPUT_SCHEMA_FIELDS = {
  token: z.string().describe('The secret token value. This should be shown to the user.'),
  name: z.string().describe('The name of the token.'),
  expires_at: z.number().describe('The expiration timestamp of the token.'),
  strict: z.boolean().optional(),
  cid: z.string().optional().describe('cid means client id'),
  aid: z.string().optional().describe('aid means application id'),
  uid: z.string().optional().describe('uid means user id'),
  domain: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  tz: z.string().optional().describe('tz means timezone'),
  lang: z.string().optional().describe('lang means language'),
  session: z.string().optional(),
  client_id: z.string().optional(),
  coworkers: z.array(z.string()).optional(),
};

// ------------------------------------------------------------------------------------------------
// Creates a single APT Grant.
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'create_auth_apt',
  {
    title: 'Add a new APT',
    description: `Creates a new Authentication Personal Token (APT).`,
    inputSchema: { ...APT_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: { ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('create_auth_apt')('Trying to create apt...');
      const expiresAtTimestamp = toDate(data.expires_at).getTime();
      const apt = await mcp.platform.auth.apts.create({ ...data, expires_at: expiresAtTimestamp }, { headers });
      const fixedApt = fixOut(apt);
      const allSafeData = z.object({ ...APT_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }).parse(fixedApt);
      mcp.log('create_auth_apt')('A new APT created with ID: %s', allSafeData.id);
      const finalResponse = { ...allSafeData };

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
