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
import { CreateCustomerDto, UpdateCustomerDto } from '@app/common/dto/career';
import { CustomerType, LocationRange } from '@app/common/enums/career';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Customer } from '@app/common/interfaces/career';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type CustomerSchema = Record<keyof Customer, ZodType>;

const CUSTOMER_SCHEMA: Partial<CustomerSchema> = {
  type: z.nativeEnum(CustomerType),
  range: z.nativeEnum(LocationRange).optional(),

  profile: z.string().optional(),

  branch: z.string().optional(),
  business: z.string(),

  location: z.string().optional(),
  addresses: z.array(z.string()).optional(),

  stores: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  employees: z.array(z.string()).optional(),

  status: z.nativeEnum(Status).optional(),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  documents: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
};

const CUSTOMER_INPUT_SCHEMA: Partial<CustomerSchema> = { ...CUSTOMER_SCHEMA, ...CORE_INPUT_SCHEMA };
const CUSTOMER_OUTPUT_SCHEMA: Partial<CustomerSchema> = { ...CUSTOMER_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count CareerCustomer

mcp.server.registerTool(
  'count_career_customers',
  {
    title: 'Count CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_career_customers', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.career.customers.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create CareerCustomer

mcp.server.registerTool(
  'create_career_customers',
  {
    title: 'Create CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: CUSTOMER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CUSTOMER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_career_customers', requestInfo, args);

      const payload = args.body as CreateCustomerDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.customers.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Customer with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk CareerCustomer

mcp.server.registerTool(
  'create-bulk_career_customers',
  {
    title: 'Create Bulk CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(CUSTOMER_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CUSTOMER_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_career_customers', requestInfo, args);

      const payload = args.body as { items: CreateCustomerDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.customers.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find CareerCustomer

mcp.server.registerTool(
  'find_career_customers',
  {
    title: 'Find CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CUSTOMER_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_career_customers', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.career.customers.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from customers.` }],
      };
    }),
);

// Find One CareerCustomer

mcp.server.registerTool(
  'find-one_career_customers',
  {
    title: 'Find One CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CUSTOMER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_career_customers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.customers.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Customer found successfully.` : `Customer not found.` }],
      };
    }),
);

// Delete One CareerCustomer

mcp.server.registerTool(
  'delete-one_career_customers',
  {
    title: 'Delete One CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CUSTOMER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_career_customers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.customers.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Customer deleted (soft) successfully.` }],
      };
    }),
);

// Restore One CareerCustomer

mcp.server.registerTool(
  'restore-one_career_customers',
  {
    title: 'Restore One CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CUSTOMER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_career_customers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.customers.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Customer restored successfully.` }],
      };
    }),
);

// Destroy One CareerCustomer

mcp.server.registerTool(
  'destroy-one_career_customers',
  {
    title: 'Destroy One CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CUSTOMER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_career_customers', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.customers.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Customer destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk CareerCustomer

mcp.server.registerTool(
  'update-bulk_career_customers',
  {
    title: 'Update Bulk CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: CUSTOMER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_career_customers', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateCustomerDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.career.customers.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One CareerCustomer

mcp.server.registerTool(
  'update-one_career_customers',
  {
    title: 'Update One CareerCustomer',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: CUSTOMER_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CUSTOMER_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_career_customers', requestInfo, args);

      const payload = args.body as UpdateCustomerDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.customers.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Customer updated successfully.` }],
      };
    }),
);
