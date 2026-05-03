import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
} from '@app/common/core/mcp';
import { CreateProfileDto, UpdateProfileDto } from '@app/common/dto/identity';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Profile } from '@app/common/interfaces/identity';
import { ProfileType } from '@app/common/enums/identity';
import { Gender, State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ProfileSchema = Record<keyof Profile, ZodType>;

const PROFILE_SCHEMA: Partial<ProfileSchema> = {
  type: z.nativeEnum(ProfileType),
  gender: z.nativeEnum(Gender),

  state: z.nativeEnum(State),

  cover: z.string().optional(),
  avatar: z.string().optional(),
  gallery: z.array(z.string()).optional(),

  nickname: z.string().optional(),
  last_name: z.string().optional(),
  first_name: z.string().optional(),
  middle_name: z.string().optional(),

  nationality: z.string().optional(),
  national_code: z.string().optional(),

  verified_at: z.string().optional(),
  verified_by: z.string().optional(),
  verified_in: z.string().optional(),

  birthdate: z.string().optional(),
};

const PROFILE_INPUT_SCHEMA: Partial<ProfileSchema> = { ...PROFILE_SCHEMA, ...CORE_INPUT_SCHEMA };
const PROFILE_OUTPUT_SCHEMA: Partial<ProfileSchema> = { ...PROFILE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count IdentityProfile

mcp.server.registerTool(
  'count_identity_profiles',
  {
    title: 'Count IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_identity_profiles', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.identity.profiles.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create IdentityProfile

mcp.server.registerTool(
  'create_identity_profiles',
  {
    title: 'Create IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ body: PROFILE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: PROFILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_identity_profiles', requestInfo, args);

      const payload = args.body as CreateProfileDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.identity.profiles.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Profile with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk IdentityProfile

mcp.server.registerTool(
  'create-bulk_identity_profiles',
  {
    title: 'Create Bulk IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(PROFILE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(PROFILE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_identity_profiles', requestInfo, args);

      const payload = args.body as { items: CreateProfileDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.identity.profiles.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find IdentityProfile

mcp.server.registerTool(
  'find_identity_profiles',
  {
    title: 'Find IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(PROFILE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_identity_profiles', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.identity.profiles.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One IdentityProfile

mcp.server.registerTool(
  'find-one_identity_profiles',
  {
    title: 'Find One IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PROFILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_identity_profiles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.profiles.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Profile found successfully.` : `Profile not found.` }],
      };
    }),
);

// Delete One IdentityProfile

mcp.server.registerTool(
  'delete-one_identity_profiles',
  {
    title: 'Delete One IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PROFILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_identity_profiles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.profiles.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Profile deleted (soft) successfully.` }],
      };
    }),
);

// Restore One IdentityProfile

mcp.server.registerTool(
  'restore-one_identity_profiles',
  {
    title: 'Restore One IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PROFILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_identity_profiles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.profiles.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Profile restored successfully.` }],
      };
    }),
);

// Destroy One IdentityProfile

mcp.server.registerTool(
  'destroy-one_identity_profiles',
  {
    title: 'Destroy One IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: PROFILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_identity_profiles', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.profiles.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Profile destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk IdentityProfile

mcp.server.registerTool(
  'update-bulk_identity_profiles',
  {
    title: 'Update Bulk IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: PROFILE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_identity_profiles', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateProfileDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.identity.profiles.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One IdentityProfile

mcp.server.registerTool(
  'update-one_identity_profiles',
  {
    title: 'Update One IdentityProfile',
    description: `Read "docs://service/identity-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: PROFILE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: PROFILE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_identity_profiles', requestInfo, args);

      const payload = args.body as UpdateProfileDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.identity.profiles.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Profile updated successfully.` }],
      };
    }),
);
