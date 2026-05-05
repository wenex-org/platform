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
import { CreateAppDto, UpdateAppDto } from '@app/common/dto/domain';
import { App, AppChangeLog } from '@app/common/interfaces/domain';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { GrantType, Status } from '@app/common/core/enums';
import { AppType } from '@app/common/enums/domain';
import { Scope } from '@app/common/core';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type AppChangeLogSchema = Record<keyof AppChangeLog, ZodType>;

const CHANGE_LOG_SCHEMA: Partial<AppChangeLogSchema> = {
  code: z.string().optional(),
  semver: z.string(),
  changes: z.array(z.string()),
  deprecation_date: z.string().optional(),

  ...CORE_INPUT_SCHEMA,
};

type AppSchema = Record<keyof App, ZodType>;

const APP_SCHEMA: Partial<AppSchema> = {
  type: z.nativeEnum(AppType),

  cid: z.string(),
  name: z.string().optional(),
  status: z.nativeEnum(Status),

  url: z.string().optional(),
  logo: z.string().optional(),
  site: z.string().optional(),
  slogan: z.string().optional(),

  scopes: z.array(z.nativeEnum(Scope)).optional(),
  grant_types: z.array(z.nativeEnum(GrantType)).optional(),

  access_token_ttl: z.number().optional(),
  refresh_token_ttl: z.number().optional(),

  change_logs: z.array(z.object(CHANGE_LOG_SCHEMA)).optional(),
};

const APP_INPUT_SCHEMA: Partial<AppSchema> = { ...APP_SCHEMA, ...CORE_INPUT_SCHEMA };
const APP_OUTPUT_SCHEMA: Partial<AppSchema> = { ...APP_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count DomainApp

mcp.server.registerTool(
  'count_domain_apps',
  {
    title: 'Count DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_domain_apps', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.domain.apps.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create DomainApp

mcp.server.registerTool(
  'create_domain_apps',
  {
    title: 'Create DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ body: APP_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: APP_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_domain_apps', requestInfo, args);

      const payload = args.body as CreateAppDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.domain.apps.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `App with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk DomainApp

mcp.server.registerTool(
  'create-bulk_domain_apps',
  {
    title: 'Create Bulk DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(APP_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(APP_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_domain_apps', requestInfo, args);

      const payload = args.body as { items: CreateAppDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.domain.apps.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find DomainApp

mcp.server.registerTool(
  'find_domain_apps',
  {
    title: 'Find DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(APP_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_domain_apps', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.domain.apps.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One DomainApp

mcp.server.registerTool(
  'find-one_domain_apps',
  {
    title: 'Find One DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: APP_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_domain_apps', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.apps.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `App found successfully.` : `App not found.` }],
      };
    }),
);

// Delete One DomainApp

mcp.server.registerTool(
  'delete-one_domain_apps',
  {
    title: 'Delete One DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: APP_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_domain_apps', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.apps.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `App deleted (soft) successfully.` }],
      };
    }),
);

// Restore One DomainApp

mcp.server.registerTool(
  'restore-one_domain_apps',
  {
    title: 'Restore One DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: APP_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_domain_apps', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.apps.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `App restored successfully.` }],
      };
    }),
);

// Destroy One DomainApp

mcp.server.registerTool(
  'destroy-one_domain_apps',
  {
    title: 'Destroy One DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: APP_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_domain_apps', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.apps.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `App destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk DomainApp

mcp.server.registerTool(
  'update-bulk_domain_apps',
  {
    title: 'Update Bulk DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: APP_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_domain_apps', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateAppDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.domain.apps.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One DomainApp

mcp.server.registerTool(
  'update-one_domain_apps',
  {
    title: 'Update One DomainApp',
    description: `Read "docs://service/domain-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: APP_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: APP_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_domain_apps', requestInfo, args);

      const payload = args.body as UpdateAppDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.domain.apps.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `App updated successfully.` }],
      };
    }),
);
