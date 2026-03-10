import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { isCron } from '@app/common/core/decorators/validation';
import { GrantDto } from '@app/common/interfaces/auth';
import { fixOut } from '@app/common/core/utils/mongo';
import { Action, Resource } from '@app/common/core';
import { isIP, isCIDR } from 'abacl';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const grantTimeSchema = z.object({
  cron_exp: z
    .string()
    .trim()
    .refine((val) => isCron(val), { message: 'cron_exp must be a valid cron expression' })
    .describe(
      'REQUIRED. Cron expression that defines when the grant becomes active. If not provided, DO NOT call this tool, you MUST ask the user.',
    ),

  duration: z
    .number()
    .positive()
    .describe('REQUIRED. Duration of the grant in seconds. If not provided, DO NOT call this tool, you MUST ask the user.'),
});

const grantBaseSchemaFields = {
  subject: z
    .string()
    .trim()
    .min(1)
    .email()
    .describe('REQUIRED. User email receiving the grant. If not provided, DO NOT call this tool, you MUST ask the user.'),

  action: z
    .nativeEnum(Action)
    .describe('REQUIRED. Permission action (e.g., read:share). If not provided, DO NOT call this tool, you MUST ask the user.'),

  object: z
    .nativeEnum(Resource)
    .describe('REQUIRED. Target resource type. If not provided, DO NOT call this tool, you MUST ask the user.'),

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
      'OPTIONAL. List of network addresses (IP/CIDR) allowed to access this resource. Leave empty if not explicitly requested.',
    ),

  field: z
    .array(z.string().trim())
    .optional()
    .describe(
      `OPTIONAL. Controls INPUT data (Write/Update access). Defines which properties of the payload the subject is allowed to send/modify.
      Uses 'notation' package syntax (dot-notation).
      Examples:
      -['*'] -> Can modify everything.
      -['*', '!role'] -> Can modify everything EXCEPT the role field.
      - ['status'] -> Can ONLY modify the status field.
      Leave empty if not explicitly requested.`,
    ),

  filter: z
    .array(z.string().trim())
    .optional()
    .describe(
      `OPTIONAL. Controls OUTPUT data (Read access). Defines which properties of the resource the subject is allowed to see in the response.
      Uses 'notation' package syntax (dot-notation).
      Examples:
      - ['*'] -> Can see everything.
      -['*', '!password', '!secret'] -> Can see everything EXCEPT password and secret.
      - ['id', 'name'] -> Can ONLY see id and name.
      Leave empty if not explicitly requested.`,
    ),

  time: z
    .array(grantTimeSchema)
    .optional()
    .describe(
      'OPTIONAL. List of time rules defining when the grant is active. Each item contains a cron schedule and duration. Leave empty if not explicitly requested.',
    ),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas & Parsers
// ------------------------------------------------------------------------------------------------

const FullGrantSchemaForParsing = z.object({
  subject: z.string().optional(),
  action: z.any().optional(),
  object: z.any().optional(),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z
    .array(
      z.object({
        cron_exp: z.string().optional(),
        duration: z.number().optional(),
      }),
    )
    .optional(),
  ...CORE_OUTPUT_SCHEMA_FIELDS,
});

const grantOutputSchemaFields = {
  id: z.string().optional().describe('The unique ID of the created Grant.'),
  subject: z.string().optional().describe('User email receiving the grant.'),
  action: z.string().optional().describe('Permission action.'),
  object: z.string().optional().describe('Target resource type.'),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z
    .array(
      z.object({
        cron_exp: z.string().optional(),
        duration: z.number().optional(),
      }),
    )
    .optional(),
  groups: z.array(z.string()).optional(),
  ref: z.string().optional(),
  owner: z.string().optional(),
  shares: z.array(z.string()).optional(),
  clients: z.array(z.string()).optional(),
  identity: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  props: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
};

// Helper function to map parsed DB output to final structured response
const mapToFinalGrantResponse = (safeData: z.infer<typeof FullGrantSchemaForParsing>) => {
  const raw = {
    id: safeData.id,
    subject: safeData.subject,
    action: safeData.action,
    object: safeData.object,
    field: safeData.field,
    filter: safeData.filter,
    location: safeData.location,
    time: safeData.time,
    groups: safeData.groups,
    ref: safeData.ref,
    owner: safeData.owner,
    shares: safeData.shares,
    clients: safeData.clients,
    identity: safeData.identity,
    description: safeData.description,
    version: safeData.version,
    props: safeData.props,
    tags: safeData.tags,
  };

  // Delete keys with undefined value
  return JSON.parse(JSON.stringify(raw));
};

// ------------------------------------------------------------------------------------------------
// Creates a single Authorization Grant.
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'create_auth_grant',
  {
    title: 'Add a new Grant',
    description: `Creates a new Authorization Grant.
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts.
                  if you haven't read it yet, READ the resource at: "docs://schemas/core" to avoid permissions errors.`,
    inputSchema: {
      ...grantBaseSchemaFields,
      ...CORE_INPUT_SCHEMA_FIELDS,
    },
    outputSchema: grantOutputSchemaFields,
  },
  async (data: GrantDto, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('create_auth_grant')('Trying to create grant...');
      const grant = await mcp.platform.auth.grants.create(data, { headers });
      const fixedGrant = fixOut(grant);
      const allSafeData = FullGrantSchemaForParsing.parse(fixedGrant);
      mcp.log('create_auth_grant')('A new grant created with ID: %s', allSafeData.id);
      const finalResponse = mapToFinalGrantResponse(allSafeData);
      return {
        structuredContent: finalResponse,
        content: [{ type: 'text', text: `Grant for subject "${finalResponse.subject}" created successfully.` }],
      };
    }),
);

// ------------------------------------------------------------------------------------------------
// Creates multiple Authorization Grants in bulk.
// ------------------------------------------------------------------------------------------------

mcp.server.registerTool(
  'create_bulk_auth_grants',
  {
    title: 'Add Multiple Grants (Bulk)',
    description: `Creates multiple Authorization Grants in a single request (Bulk operation).
                  Use this tool whenever the user needs to assign multiple permissions at once to save network overhead.
                  IMPORTANT: Before using this tool, you MUST understand the Wenex core concepts.
                  if you haven't read it yet, READ the resource at: "docs://schemas/core" to avoid permissions errors.`,
    inputSchema: {
      items: z.array(z.object(grantBaseSchemaFields)).min(1).describe('REQUIRED. An array containing the grants to be created.'),
      ...CORE_INPUT_SCHEMA_FIELDS,
    },
    outputSchema: {
      items: z.array(z.object(grantOutputSchemaFields)).describe('List of the created grants.'),
    },
  },
  async (data: { items: GrantDto[] }, { requestInfo }) =>
    throwableToolCall(async () => {
      const headers = getHeaders({ requestInfo });
      mcp.log('create_bulk_auth_grants')('Trying to create bulk grants...');
      const grants = await mcp.platform.auth.grants.createBulk({ items: data.items }, { headers });
      const fixedGrants = fixOut(grants);
      const allSafeDataArray = z.array(FullGrantSchemaForParsing).parse(fixedGrants);
      mcp.log('create_bulk_auth_grants')('%d grants created in bulk', allSafeDataArray.length);
      const finalResponseItems = allSafeDataArray.map(mapToFinalGrantResponse);
      return {
        structuredContent: { items: finalResponseItems },
        content: [{ type: 'text', text: `${finalResponseItems.length} Grants created successfully in bulk.` }],
      };
    }),
);
