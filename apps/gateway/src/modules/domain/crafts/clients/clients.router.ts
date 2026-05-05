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
import { ClientPlan, ClientServiceProvider, ClientServiceType } from '@app/common/enums/domain';
import { Client, ClientDomain, ClientService } from '@app/common/interfaces/domain';
import { CreateClientDto, UpdateClientDto } from '@app/common/dto/domain';
import { GrantType, State, Status } from '@app/common/core/enums';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Scope } from '@app/common/core';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ClientDomainSchema = Record<keyof ClientDomain, ZodType>;

const DOMAIN_SCHEMA: Partial<ClientDomainSchema> = {
  name: z.string(),
  status: z.nativeEnum(Status),

  ...CORE_INPUT_SCHEMA,
};

type ClientServiceSchema = Record<keyof ClientService, ZodType>;

const SERVICE_SCHEMA: Partial<ClientServiceSchema> = {
  type: z.nativeEnum(ClientServiceType),
  provider: z.nativeEnum(ClientServiceProvider),

  config: z.any(),

  ...CORE_INPUT_SCHEMA,
};

type ClientSchema = Record<keyof Client, ZodType>;

const CLIENT_SCHEMA: Partial<ClientSchema> = {
  name: z.string(),
  plan: z.nativeEnum(ClientPlan),

  url: z.string().optional(),
  logo: z.string().optional(),
  site: z.string().optional(),
  slogan: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),

  api_key: z.string().optional(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  expiration_date: z.string().optional(),

  access_token_ttl: z.number().optional(),
  refresh_token_ttl: z.number().optional(),

  scopes: z.array(z.nativeEnum(Scope)),
  whitelist: z.array(z.string()).optional(),
  coworkers: z.array(z.string()).optional(),
  grant_types: z.array(z.nativeEnum(GrantType)),

  domains: z.array(z.object(DOMAIN_SCHEMA)).optional(),
  services: z.array(z.object(SERVICE_SCHEMA)).optional(),
};

const CLIENT_INPUT_SCHEMA: Partial<ClientSchema> = { ...CLIENT_SCHEMA, ...CORE_INPUT_SCHEMA };
const CLIENT_OUTPUT_SCHEMA: Partial<ClientSchema> = { ...CLIENT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count DomainClient

mcp.server.registerTool(
  'count_domain_clients',
  {
    title: 'Count DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_domain_clients', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.domain.clients.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create DomainClient

mcp.server.registerTool(
  'create_domain_clients',
  {
    title: 'Create DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ body: CLIENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CLIENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_domain_clients', requestInfo, args);

      const payload = args.body as CreateClientDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.domain.clients.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Client with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk DomainClient

mcp.server.registerTool(
  'create-bulk_domain_clients',
  {
    title: 'Create Bulk DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(CLIENT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CLIENT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_domain_clients', requestInfo, args);

      const payload = args.body as { items: CreateClientDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.domain.clients.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find DomainClient

mcp.server.registerTool(
  'find_domain_clients',
  {
    title: 'Find DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CLIENT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_domain_clients', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.domain.clients.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One DomainClient

mcp.server.registerTool(
  'find-one_domain_clients',
  {
    title: 'Find One DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CLIENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_domain_clients', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.clients.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Client found successfully.` : `Client not found.` }],
      };
    }),
);

// Delete One DomainClient

mcp.server.registerTool(
  'delete-one_domain_clients',
  {
    title: 'Delete One DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CLIENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_domain_clients', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.clients.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Client deleted (soft) successfully.` }],
      };
    }),
);

// Restore One DomainClient

mcp.server.registerTool(
  'restore-one_domain_clients',
  {
    title: 'Restore One DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CLIENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_domain_clients', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.clients.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Client restored successfully.` }],
      };
    }),
);

// Destroy One DomainClient

mcp.server.registerTool(
  'destroy-one_domain_clients',
  {
    title: 'Destroy One DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CLIENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_domain_clients', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.clients.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Client destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk DomainClient

mcp.server.registerTool(
  'update-bulk_domain_clients',
  {
    title: 'Update Bulk DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: CLIENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_domain_clients', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateClientDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.domain.clients.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One DomainClient

mcp.server.registerTool(
  'update-one_domain_clients',
  {
    title: 'Update One DomainClient',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: CLIENT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CLIENT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_domain_clients', requestInfo, args);

      const payload = args.body as UpdateClientDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.clients.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Client updated successfully.` }],
      };
    }),
);
