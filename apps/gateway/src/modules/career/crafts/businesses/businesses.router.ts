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
import { CreateBusinessDto, UpdateBusinessDto } from '@app/common/dto/career';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Business } from '@app/common/interfaces/career';
import { BusinessType } from '@app/common/enums/career';
import { State, Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type BusinessSchema = Record<keyof Business, ZodType>;

const BUSINESS_SCHEMA: Partial<BusinessSchema> = {
  name: z.string(),
  type: z.nativeEnum(BusinessType),

  code: z.string().optional(),
  alias: z.string().optional(),

  logo: z.string().optional(),
  cover: z.string().optional(),
  slogan: z.string().optional(),

  state: z.nativeEnum(State),
  status: z.nativeEnum(Status),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  address: z.string().optional(),
  support: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  categories: z.array(z.string()).optional(),

  founder: z.string().optional(),
  co_founders: z.array(z.string()).optional(),

  partners: z.array(z.string()).optional(),
  investors: z.array(z.string()).optional(),
  suppliers: z.array(z.string()).optional(),
  customers: z.array(z.string()).optional(),

  foundation_date: z.string().optional(),
};

const BUSINESS_INPUT_SCHEMA: Partial<BusinessSchema> = { ...BUSINESS_SCHEMA, ...CORE_INPUT_SCHEMA };
const BUSINESS_OUTPUT_SCHEMA: Partial<BusinessSchema> = { ...BUSINESS_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count CareerBusiness

mcp.server.registerTool(
  'count_career_businesses',
  {
    title: 'Count CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_career_businesses', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.career.businesses.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create CareerBusiness

mcp.server.registerTool(
  'create_career_businesses',
  {
    title: 'Create CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: BUSINESS_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: BUSINESS_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_career_businesses', requestInfo, args);

      const payload = args.body as CreateBusinessDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.businesses.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Business with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk CareerBusiness

mcp.server.registerTool(
  'create-bulk_career_businesses',
  {
    title: 'Create Bulk CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(BUSINESS_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(BUSINESS_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_career_businesses', requestInfo, args);

      const payload = args.body as { items: CreateBusinessDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.businesses.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find CareerBusiness

mcp.server.registerTool(
  'find_career_businesses',
  {
    title: 'Find CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(BUSINESS_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_career_businesses', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.career.businesses.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from businesses.` }],
      };
    }),
);

// Find One CareerBusiness

mcp.server.registerTool(
  'find-one_career_businesses',
  {
    title: 'Find One CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BUSINESS_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_career_businesses', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.businesses.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Business found successfully.` : `Business not found.` }],
      };
    }),
);

// Delete One CareerBusiness

mcp.server.registerTool(
  'delete-one_career_businesses',
  {
    title: 'Delete One CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BUSINESS_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_career_businesses', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.businesses.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Business deleted (soft) successfully.` }],
      };
    }),
);

// Restore One CareerBusiness

mcp.server.registerTool(
  'restore-one_career_businesses',
  {
    title: 'Restore One CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BUSINESS_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_career_businesses', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.businesses.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Business restored successfully.` }],
      };
    }),
);

// Destroy One CareerBusiness

mcp.server.registerTool(
  'destroy-one_career_businesses',
  {
    title: 'Destroy One CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: BUSINESS_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_career_businesses', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.businesses.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Business destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk CareerBusiness

mcp.server.registerTool(
  'update-bulk_career_businesses',
  {
    title: 'Update Bulk CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: BUSINESS_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_career_businesses', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateBusinessDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.career.businesses.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One CareerBusiness

mcp.server.registerTool(
  'update-one_career_businesses',
  {
    title: 'Update One CareerBusiness',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: BUSINESS_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: BUSINESS_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_career_businesses', requestInfo, args);

      const payload = args.body as UpdateBusinessDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.businesses.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Business updated successfully.` }],
      };
    }),
);
