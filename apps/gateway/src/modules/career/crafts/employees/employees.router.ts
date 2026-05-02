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
import { CreateEmployeeDto, UpdateEmployeeDto } from '@app/common/dto/career';
import { EmployeeType, LocationRange } from '@app/common/enums/career';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Employee } from '@app/common/interfaces/career';
import { State, Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type EmployeeSchema = Record<keyof Employee, ZodType>;

const EMPLOYEE_SCHEMA: Partial<EmployeeSchema> = {
  type: z.nativeEnum(EmployeeType),
  range: z.nativeEnum(LocationRange).optional(),

  job_title: z.string(),
  profile: z.string(),

  branch: z.string(),
  manager: z.string(),
  business: z.string(),

  location: z.string(),
  services: z.array(z.string()),

  state: z.nativeEnum(State),
  status: z.nativeEnum(Status),

  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  salary: z.number().optional(),
  currency: z.string(),
  department: z.string(),

  grade: z.number().optional(),
  level: z.string(),

  hire_date: z.string().optional(),
  fire_date: z.string().optional(),

  skills: z.array(z.string()),
  documents: z.array(z.string()),
  certifications: z.array(z.string()),
};

const EMPLOYEE_INPUT_SCHEMA: Partial<EmployeeSchema> = { ...EMPLOYEE_SCHEMA, ...CORE_INPUT_SCHEMA };
const EMPLOYEE_OUTPUT_SCHEMA: Partial<EmployeeSchema> = { ...EMPLOYEE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count CareerEmployee

mcp.server.registerTool(
  'count_career_employees',
  {
    title: 'Count CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_career_employees', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.career.employees.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create CareerEmployee

mcp.server.registerTool(
  'create_career_employees',
  {
    title: 'Create CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: EMPLOYEE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: EMPLOYEE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_career_employees', requestInfo, args);

      const payload = args.body as CreateEmployeeDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.employees.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Employee with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk CareerEmployee

mcp.server.registerTool(
  'create-bulk_career_employees',
  {
    title: 'Create Bulk CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(EMPLOYEE_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(EMPLOYEE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_career_employees', requestInfo, args);

      const payload = args.body as { items: CreateEmployeeDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.career.employees.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find CareerEmployee

mcp.server.registerTool(
  'find_career_employees',
  {
    title: 'Find CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(EMPLOYEE_OUTPUT_SCHEMA) }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_career_employees', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.career.employees.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from employees.` }],
      };
    }),
);

// Find One CareerEmployee

mcp.server.registerTool(
  'find-one_career_employees',
  {
    title: 'Find One CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMPLOYEE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_career_employees', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.employees.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Employee found successfully.` : `Employee not found.` }],
      };
    }),
);

// Delete One CareerEmployee

mcp.server.registerTool(
  'delete-one_career_employees',
  {
    title: 'Delete One CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMPLOYEE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_career_employees', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.employees.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Employee deleted (soft) successfully.` }],
      };
    }),
);

// Restore One CareerEmployee

mcp.server.registerTool(
  'restore-one_career_employees',
  {
    title: 'Restore One CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMPLOYEE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_career_employees', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.employees.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Employee restored successfully.` }],
      };
    }),
);

// Destroy One CareerEmployee

mcp.server.registerTool(
  'destroy-one_career_employees',
  {
    title: 'Destroy One CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMPLOYEE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_career_employees', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.employees.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Employee destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk CareerEmployee

mcp.server.registerTool(
  'update-bulk_career_employees',
  {
    title: 'Update Bulk CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: EMPLOYEE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_career_employees', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateEmployeeDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.career.employees.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One CareerEmployee

mcp.server.registerTool(
  'update-one_career_employees',
  {
    title: 'Update One CareerEmployee',
    description: `Read "docs://service/career-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: EMPLOYEE_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: EMPLOYEE_OUTPUT_SCHEMA }),
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_career_employees', requestInfo, args);

      const payload = args.body as UpdateEmployeeDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.career.employees.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Employee updated successfully.` }],
      };
    }),
);
