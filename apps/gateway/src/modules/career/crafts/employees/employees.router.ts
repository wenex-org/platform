import {
  CORE_INPUT_SCHEMA_FIELDS,
  CORE_OUTPUT_SCHEMA_FIELDS,
  CORE_DATA_DICTIONARY,
  getHeaders,
  ServerMCP,
  throwableToolCall,
} from '@app/common/core/mcp';
import { MAX_LEARNING_RATE, MAX_RATING_VALUE, MIN_LEARNING_RATE, MIN_RATING_VALUE } from '@app/common/core/constants';
import { EmployeeType, LocationRange } from '@app/common/enums/career';
import { fixOut } from '@app/common/core/utils/mongo';
import { State, Status } from '@app/common/core/enums';
import { isDate, isMongoId } from 'class-validator';
import { z } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------------------------------------------
// Shared Input Schemas
// ------------------------------------------------------------------------------------------------

const EMPLOYEE_INPUT_SCHEMA_FIELDS = {
  type: z
    .nativeEnum(EmployeeType)
    .describe(
      'REQUIRED. Employee type (e.g., FULL_TIME, PART_TIME, CONTRACT, TEMPORARY). If not provided, DO NOT call this tool, you MUST ask the user.',
    ),
  range: z
    .nativeEnum(LocationRange)
    .optional()
    .describe('OPTIONAL. Geographic coverage range of the employee (e.g., CITY, COUNTRY, PROVINCE).'),
  job_title: z
    .string()
    .trim()
    .min(1)
    .describe('REQUIRED. Job title of the employee. If not provided, DO NOT call this tool, you MUST ask the user.'),
  profile: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid profile id' })
    .optional()
    .describe('OPTIONAL. Profile id (mongo id) linked to this employee.'),
  branch: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid branch id' })
    .optional()
    .describe('OPTIONAL. Branch id (mongo id) this employee is assigned to.'),
  manager: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid manager id' })
    .optional()
    .describe('OPTIONAL. Manager id (mongo id) who supervises this employee.'),
  business: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid business id' })
    .describe(
      'REQUIRED. Business id (mongo id) this employee belongs to. If not provided, DO NOT call this tool, you MUST ask the user.',
    ),
  location: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid location id' })
    .optional()
    .describe('OPTIONAL. Location id (mongo id) associated with the employee.'),
  services: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid service id' }),
    )
    .optional()
    .describe('OPTIONAL. List of service ids (mongo ids) the employee provides.'),
  state: z.nativeEnum(State).optional().describe('OPTIONAL. Lifecycle state of the employee (e.g., PENDING, APPROVED).'),
  status: z
    .nativeEnum(Status)
    .describe(
      'REQUIRED. Operational status of the employee (e.g., ACTIVE, INACTIVE). If not provided, DO NOT call this tool, you MUST ask the user.',
    ),
  rate: z.number().min(MIN_LEARNING_RATE).max(MAX_LEARNING_RATE).optional().describe('OPTIONAL. Learning rate of the employee.'),
  votes: z.number().int().min(0).optional().describe('OPTIONAL. Number of votes for this employee.'),
  rating: z.number().min(MIN_RATING_VALUE).max(MAX_RATING_VALUE).optional().describe('OPTIONAL. Rating value of the employee.'),
  salary: z.number().min(0).optional().describe('OPTIONAL. Salary amount of the employee.'),
  currency: z
    .string()
    .trim()
    .refine((val) => isMongoId(val), { message: 'Invalid currency id' })
    .optional()
    .describe('OPTIONAL. Currency id (mongo id) for the salary.'),
  department: z.string().trim().optional().describe('OPTIONAL. Department name the employee belongs to.'),
  grade: z.number().optional().describe('OPTIONAL. Grade/level number of the employee.'),
  level: z.string().trim().optional().describe('OPTIONAL. Level label of the employee (e.g., Junior, Senior).'),
  hire_date: z
    .string()
    .trim()
    .refine((val) => isDate(val), { message: 'Invalid date' })
    .optional()
    .describe('OPTIONAL. Hire date of the employee in ISO format.'),
  fire_date: z
    .string()
    .trim()
    .refine((val) => isDate(val), { message: 'Invalid date' })
    .optional()
    .describe('OPTIONAL. Termination/fire date of the employee in ISO format.'),
  skills: z.array(z.string().trim()).optional().describe('OPTIONAL. List of skill labels or tags associated with the employee.'),
  documents: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid document id' }),
    )
    .optional()
    .describe('OPTIONAL. List of document ids (mongo ids) belonging to this employee.'),
  certifications: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isMongoId(val), { message: 'Invalid certification id' }),
    )
    .optional()
    .describe('OPTIONAL. List of certification ids (mongo ids) held by this employee.'),
};

// ------------------------------------------------------------------------------------------------
// Shared Output Schemas
// ------------------------------------------------------------------------------------------------

const EMPLOYEE_OUTPUT_SCHEMA_FIELDS = {
  type: z.string().optional(),
  range: z.string().optional(),
  job_title: z.string().optional(),
  profile: z.string().optional(),
  branch: z.string().optional(),
  manager: z.string().optional(),
  business: z.string().optional(),
  location: z.string().optional(),
  services: z.array(z.string()).optional(),
  state: z.string().optional(),
  status: z.string().optional(),
  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),
  salary: z.number().optional(),
  currency: z.string().optional(),
  department: z.string().optional(),
  grade: z.number().optional(),
  level: z.string().optional(),
  hire_date: z.string().optional(),
  fire_date: z.string().optional(),
  skills: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
};

// ------------------------------------------------------------------------------------------------
// Shared Data Dictionary
// ------------------------------------------------------------------------------------------------

const EMPLOYEE_DATA_DICTIONARY = `
  type: REQUIRED. Employee type enum (FULL_TIME, PART_TIME, CONTRACT, TEMPORARY).
  range: OPTIONAL. Geographic location range enum (CITY, COUNTY, DISTRICT, COUNTRY, PROVINCE, STATE, ROAD, SUBURB, QUARTER, VILLAGE, MUNICIPALITY).
  job_title: REQUIRED. Job title of the employee.
  profile: OPTIONAL. Profile id (mongo id) linked to this employee.
  branch: OPTIONAL. Branch id (mongo id) the employee is assigned to.
  manager: OPTIONAL. Manager id (mongo id) who supervises this employee.
  business: REQUIRED. Business id (mongo id) this employee belongs to.
  location: OPTIONAL. Location id (mongo id) of the employee.
  services: OPTIONAL. List of service ids (mongo ids) the employee provides.
  state: OPTIONAL. State enum (PENDING, APPROVED, etc.).
  status: REQUIRED. Status enum (ACTIVE, INACTIVE, etc.).
  rate/votes/rating: OPTIONAL. Numeric performance metrics.
  salary: OPTIONAL. Salary amount.
  currency: OPTIONAL. Currency id (mongo id) for the salary.
  department: OPTIONAL. Department name.
  grade: OPTIONAL. Grade/level number.
  level: OPTIONAL. Level label (e.g., Junior, Senior).
  hire_date/fire_date: OPTIONAL. Employment dates in ISO format.
  skills: OPTIONAL. List of skill labels or tags.
  documents: OPTIONAL. List of document ids (mongo ids).
  certifications: OPTIONAL. List of certification ids (mongo ids).
`.trim();

// ------------------------------------------------------------------------------------------------
// Search Schemas (Abstract Syntax Tree (AST) / Query Builder for LLM)
// ------------------------------------------------------------------------------------------------

const FIELD_OPERATOR = z.enum([
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'nin',
  'regex',
  'exists',
  'near',
  'nearSphere',
  'geoWithin',
  'geoIntersects',
]);

const LOGICAL_OPERATOR = z.enum(['and', 'or']);
const ALLOWED_POPULATES = z.enum(['owner', 'shares', 'clients', 'groups']);

export type AstNode =
  | { logical: z.infer<typeof LOGICAL_OPERATOR>; conditions: AstNode[] }
  | { field: string; operator: z.infer<typeof FIELD_OPERATOR>; value: any };

const AST_NODE_SCHEMA: z.ZodType<AstNode> = z.lazy(() =>
  z.union([
    z.object({
      logical: LOGICAL_OPERATOR.describe("REQUIRED for grouping. Use 'and' or 'or'."),
      conditions: z.array(AST_NODE_SCHEMA).min(1).describe('REQUIRED. Array of nested conditions.'),
    }),
    z.object({
      field: z
        .string()
        .trim()
        .describe(
          `REQUIRED. Exact DB field name.
          MAPPINGS (Employee fields):
            "employee kind/category" -> type |
            "location range/coverage area" -> range |
            "job title/position/role" -> job_title |
            "employee profile/user profile" -> profile |
            "employee branch/assigned branch" -> branch |
            "supervisor/line manager/manager" -> manager |
            "company/organization/parent business" -> business |
            "employee location" -> location |
            "services/provided services" -> services |
            "approval state" -> state |
            "active/inactive/operational status" -> status |
            "learning rate/rate" -> rate |
            "number of votes/votes" -> votes |
            "score/rating" -> rating |
            "salary/compensation/pay" -> salary |
            "salary currency/currency" -> currency |
            "department/team/unit" -> department |
            "grade/seniority level number" -> grade |
            "level/seniority label" -> level |
            "hire date/start date/joined" -> hire_date |
            "fire date/termination date/left" -> fire_date |
            "skills/competencies/expertise" -> skills |
            "documents/files" -> documents |
            "certifications/certificates" -> certifications.
          MAPPINGS (Core fields): "owner/creator" -> owner | "shared with" -> shares | "group" -> groups | "client" -> clients | "tag/label" -> tags | "ref/external id" -> ref.
          Support dot-notation for nested fields. DO NOT invent fields.`,
        ),
      operator: FIELD_OPERATOR.describe(
        `REQUIRED. Comparison or geospatial operator.
        [CRITICAL RULE FOR 'regex']: If the user asks for a "contains", "like", or "search" operation, you MUST use the 'regex' operator and pass ONLY the raw exact string in 'value'.
        DO NOT manually add '.*', '^', or '$' wildcards.`,
      ),
      value: z
        .union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.any())])
        .describe('REQUIRED. The value to match.'),
    }),
  ]),
);

const ROOT_QUERY_SCHEMA = z.object({
  logical: z.literal('and').default('and').describe("The root must always be an 'and' operator."),
  conditions: z.array(AST_NODE_SCHEMA).default([]).describe(`OPTIONAL. The nested AST conditions.
    Example for "type is FULL_TIME OR status is ACTIVE":
    {
      "logical": "and",
      "conditions": [
        {
          "logical": "or",
          "conditions": [
            { "field": "type", "operator": "eq", "value": "FULL_TIME" },
            { "field": "status", "operator": "eq", "value": "ACTIVE" }
          ]
        }
      ]
    }`),
});

// Recursively builds a MongoDB query object from the AST node
function buildMongoQuery(node: AstNode): Record<string, any> {
  if ('logical' in node) {
    if (!node.conditions?.length) return {};
    const mappedConditions = node.conditions.map((child) => buildMongoQuery(child));
    return { [`$${node.logical}`]: mappedConditions };
  }

  const { field, operator, value } = node;

  switch (operator) {
    case 'eq':
      return { [field]: value };

    case 'regex': {
      let regexStr = String(value);
      // Clean up LLM hallucinations: Remove leading and trailing '.*' if they exist
      if (regexStr.startsWith('.*') && regexStr.endsWith('.*')) {
        regexStr = regexStr.slice(2, -2);
      }
      return { [field]: { $regex: regexStr, $options: 'i' } };
    }

    case 'exists':
      return { [field]: { $exists: Boolean(value) } };

    case 'near':
    case 'nearSphere':
    case 'geoWithin':
    case 'geoIntersects':
      return { [field]: { [`$${operator}`]: value } };

    default:
      return { [field]: { [`$${operator}`]: value } };
  }
}

// ------------------------------------------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------
// Search & Get Count Career Employees
// ------------------------------------------------
mcp.server.registerTool(
  'count_career_employee',
  {
    title: 'Get Count Career Employee',
    description:
      `[ACTION] Calculates and returns the EXACT total number of Career Employees matching criteria without fetching documents.
      [TRIGGER] Use ONLY when the user explicitly asks for "how many", "count", "number of", or "total" employees.
      [RULES]
      1. PERFORMANCE: Never use 'find_career_employee' to count items. Always use this tool to save network bandwidth.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    inputSchema: { ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Query tree. Leave empty to count all employees.') },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of employees matching the conditions.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('count_career_employee');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type CountPayload = Parameters<typeof mcp.platform.career.employees.count>[0];
      const payload: CountPayload = { query: mongoQuery } as CountPayload;

      const totalCount = await mcp.platform.career.employees.count(payload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `There are exactly ${safeData.count} employees matching your criteria.` }],
      };
    }),
);

// ------------------------------------------------
// Create Career Employee
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_employee',
  {
    title: 'Create Career Employee',
    description: `[ACTION] Creates a single new Career Employee.
      [TRIGGER] Use when the user explicitly asks to create or add a new employee.
      [RULES]
      1. ACCURACY: Ensure all REQUIRED fields (type, job_title, business, status) are present or ask the user before calling this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: { ...EMPLOYEE_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS },
    outputSchema: {
      ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_employee');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create employee...');

      // Ensure payload matches platform SDK type
      type CreatePayload = Parameters<typeof mcp.platform.career.employees.create>[0];
      const payload = data as CreatePayload;

      const employee = await mcp.platform.career.employees.create(payload, { headers });
      const fixedEmployee = fixOut(employee);

      const schema = z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedEmployee);

      logger('A new employee created with ID: %s', safeData.id);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Employee "${safeData.job_title || safeData.id}" created successfully.` }],
      };
    }),
);

// ------------------------------------------------
// Creates Multiple Career Employees in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'create_career_employee_bulk',
  {
    title: 'Create Multiple Career Employees (Bulk)',
    description: `[ACTION] Creates multiple Career Employees in a single request (Bulk operation).
      [TRIGGER] Use when the user needs to create multiple employees at once.
      [RULES]
      1. PERFORMANCE: Prefer this tool over calling 'create_career_employee' multiple times in a loop.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      items: z
        .array(z.object({ ...EMPLOYEE_INPUT_SCHEMA_FIELDS, ...CORE_INPUT_SCHEMA_FIELDS }))
        .min(1)
        .describe('REQUIRED. An array containing the employees to be created.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('List of the created employees.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('create_career_employee_bulk');
      const headers = getHeaders({ requestInfo });

      logger('Trying to create bulk employees...');

      // Ensure payload matches platform SDK type
      type CreateBulkPayload = Parameters<typeof mcp.platform.career.employees.createBulk>[0];
      const bulkPayload = data as CreateBulkPayload;

      const employees = await mcp.platform.career.employees.createBulk(bulkPayload, { headers });
      const fixedEmployees = fixOut(employees);

      const schemaArray = z.array(z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(fixedEmployees);

      logger('%d employees created in bulk', safeDataArray.length);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `${safeDataArray.length} Employees created successfully in bulk.` }],
      };
    }),
);

// ------------------------------------------------
// Search & Get Career Employees
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_employee',
  {
    title: 'Find Career Employee',
    description: `[ACTION] Fetches Career Employees using advanced AST filtering, pagination, and relation population.
      [TRIGGER] Use when the user asks to list, search, or find employees based on criteria.
      [RULES]
      1. DO NOT use this tool if the user only wants the "total number" or "count" (Use 'count_career_employee' instead).
      2. MAPPING: Map natural language fields to exact DB fields accurately using the Dictionary.
      [PAGINATION] Defaults to page 1, limit 20. If the user asks for "all" records, you MUST iterate through pages.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe('OPTIONAL. Nested AST query tree for advanced filtering.'),
      projection: z.array(z.string().trim()).optional().describe(`OPTIONAL. Controls output fields.`),
      populate: z.array(ALLOWED_POPULATES).optional().describe('OPTIONAL. Relations to join.'),
      pagination: z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
        })
        .optional()
        .describe('OPTIONAL. Pagination config. Default is page 1, limit 20.'),
    },
    outputSchema: {
      items: z
        .array(z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }))
        .optional()
        .describe('The list of matching employees.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_employee');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT (AST & Config) === : %j', data);

      const mongoQuery = data.ast_query?.conditions?.length ? buildMongoQuery(data.ast_query as AstNode) : {};

      // Extract exact SDK type for payload to enforce compile-time safety
      type FindFilterPayload = Parameters<typeof mcp.platform.career.employees.find>[0];
      const filterPayload: FindFilterPayload = {
        query: mongoQuery,
        projection: data.projection as FindFilterPayload['projection'],
        populate: data.populate as FindFilterPayload['populate'],
        pagination: data.pagination as FindFilterPayload['pagination'],
      };

      const employeesArray = await mcp.platform.career.employees.find(filterPayload, { headers });

      logger('=== 2. RAW DB OUTPUT === : %j', employeesArray);

      const schemaArray = z.array(z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS }));
      const safeDataArray = schemaArray.parse(employeesArray);

      logger('=== 3. AFTER ZOD PARSE === : %j', safeDataArray);

      return {
        structuredContent: { items: safeDataArray },
        content: [{ type: 'text', text: `Search completed successfully. Found ${safeDataArray.length} employees.` }],
      };
    }),
);

// ------------------------------------------------
// Find Career Employee By Id
// ------------------------------------------------
mcp.server.registerTool(
  'find_career_employee_by_id',
  {
    title: 'Find Career Employee By Id',
    description:
      `[ACTION] Retrieves the complete, detailed record of a specific Career Employee using its exact MongoDB ObjectId or external reference (ref).
      [TRIGGER] Use when the user provides an exact ID or asks for full details of a specific employee identified in a previous step.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If searching by job title or type, use 'find_career_employee' first to extract the correct ID, THEN call this tool.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
        .replace(/\s+/g, ' ')
        .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId to find. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('find_career_employee_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type FindByIdConfig = Parameters<typeof mcp.platform.career.employees.findById>[1];
      const config: FindByIdConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const employee = await mcp.platform.career.employees.findById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', employee);

      const fixedEmployee = fixOut(employee);

      const schema = z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedEmployee);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `Employee with ID "${data.id}" was successfully found.` }],
      };
    }),
);

// ------------------------------------------------
// Delete Career Employee By Id
// ------------------------------------------------
mcp.server.registerTool(
  'delete_career_employee_by_id',
  {
    title: 'Delete Career Employee By Id',
    description: `[ACTION] Soft-deletes a Career Employee by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to remove or delete a specific employee.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Delete the senior developer employee"), you MUST use 'find_career_employee' first to retrieve the correct exact ID.
      [WARNING] DESTRUCTIVE ACTION: Make sure you have the correct ID before executing.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the employee. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('delete_career_employee_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type DeleteConfig = Parameters<typeof mcp.platform.career.employees.deleteById>[1];
      const config: DeleteConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const deletedEmployee = await mcp.platform.career.employees.deleteById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', deletedEmployee);

      const fixedDeletedEmployee = fixOut(deletedEmployee);

      const schema = z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDeletedEmployee);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Employee with ID "${safeData.id}" (Job Title: ${safeData.job_title || 'Unknown'}) was deleted.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Restore Career Employee By Id
// ------------------------------------------------
mcp.server.registerTool(
  'restore_career_employee_by_id',
  {
    title: 'Restore Career Employee By Id',
    description: `[ACTION] Restores (un-deletes) a previously soft-deleted Career Employee by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to restore, recover, reactivate, or undelete a specific employee.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Restore the full-time employee"), you MUST use 'find_career_employee'
      (with appropriate filters for deleted items) first to retrieve the correct exact ID.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the employee. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
    },
    outputSchema: {
      ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('restore_career_employee_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      type RestoreConfig = Parameters<typeof mcp.platform.career.employees.restoreById>[1];
      const config: RestoreConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const restoredEmployee = await mcp.platform.career.employees.restoreById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', restoredEmployee);

      const fixedRestoredEmployee = fixOut(restoredEmployee);

      const schema = z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedRestoredEmployee);

      logger('=== 3. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Employee with ID ${safeData.id} (Job Title: ${safeData.job_title || 'Unknown'}) was restored.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Destroy Career Employee By Id
// ------------------------------------------------
mcp.server.registerTool(
  'destroy_career_employee_by_id',
  {
    title: 'Destroy Career Employee By Id',
    description: `[ACTION] Permanently destroys (hard-deletes) a Career Employee by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to "permanently delete", "destroy", "purge", or "completely remove" an employee.
      [RULES]
      1. CONFIRMATION REQUIRED: NEVER execute this tool immediately. First, explain to the user that this action is IRREVERSIBLE,
          show them the Employee ID/Job Title, and ask for their explicit confirmation (e.g., "Are you absolutely sure?").
          ONLY call this tool AFTER the user replies "yes".
      2. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      3. CHAINING: If the exact ID is unknown, MUST use 'find_career_employee' first to retrieve it.
      [WARNING] IRREVERSIBLE ACTION: This permanently removes the record from the database. It CANNOT be restored.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the employee. Do not guess.'),
      ref: z
        .string()
        .trim()
        .optional()
        .describe('OPTIONAL. External reference identity (query parameter). Leave empty unless explicitly requested.'),
      verification_code: z
        .string()
        .trim()
        .optional()
        .describe(
          `CRITICAL: MUST be exactly 'CONFIRM_DESTROY'. 
          If the user's prompt DOES NOT contain the exact phrase 'CONFIRM_DESTROY', you MUST leave this field empty. Do NOT auto-fill or guess this.`,
        ),
    },
    outputSchema: {
      ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('destroy_career_employee_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      if (data.verification_code !== 'CONFIRM_DESTROY') {
        logger('=== BLOCKED: Waiting for User Confirmation ===');

        const blockedPayload = {
          status: 'BLOCKED_AWAITING_CONFIRMATION' as const,
          message: 'Security Gate: User confirmation required.',
        };

        return {
          structuredContent: blockedPayload,
          content: [
            {
              type: 'text',
              text: ` SYSTEM SECURITY GATE: Execution BLOCKED.
                    You MUST STOP and ask the user this exact question right now:
                    "WARNING: You are about to PERMANENTLY destroy this employee.
                    This action cannot be undone and the data will be lost forever.
                    To proceed, please reply with the exact phrase: CONFIRM_DESTROY"`,
            },
          ],
        };
      }

      logger('=== UNLOCKED: Executing Destruction ===');
      type DestroyConfig = Parameters<typeof mcp.platform.career.employees.destroyById>[1];
      const config: DestroyConfig = {
        headers,
        ...(data.ref && { params: { ref: data.ref } }),
      };

      const destroyedEmployee = await mcp.platform.career.employees.destroyById(data.id, config);

      logger('=== 2. RAW DB OUTPUT === : %j', destroyedEmployee);

      const fixedDestroyedEmployee = fixOut(destroyedEmployee);

      const schema = z.object({ ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS, ...CORE_OUTPUT_SCHEMA_FIELDS });
      const safeData = schema.parse(fixedDestroyedEmployee);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Employee with ID ${safeData.id} (Job Title: ${safeData.job_title || 'Unknown'}) was destroyed.`,
          },
        ],
      };
    }),
);

// ------------------------------------------------
// Update Multiple Career Employees in Bulk
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_employee_bulk',
  {
    title: 'Update Multiple Career Employees (Bulk)',
    description: `[ACTION] Updates multiple Career Employees matching a query in a single request.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, or change multiple employees at once based on a filter.
      [RULES]
      1. NO HALLUCINATION: Build the AST query accurately from the user's intent.
      2. PARTIAL UPDATE: Only include the fields that actually need to be changed in the update payload.
      3. CONFIRMATION: If the query is broad (e.g., no conditions), warn the user before proceeding — this can affect many records.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      ast_query: ROOT_QUERY_SCHEMA.optional().describe(
        'OPTIONAL. Query tree to select which employees to update. Leave empty to match all accessible.',
      ),
      // Merge Employee + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...EMPLOYEE_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      count: z.number().min(0).optional().describe('The total number of employees that were updated.'),
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_employee_bulk');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      const { ast_query, ...updatePayload } = data;
      const mongoQuery = ast_query?.conditions?.length ? buildMongoQuery(ast_query as AstNode) : {};

      // Extract exact SDK type to enforce compile-time safety
      type UpdateBulkPayload = Parameters<typeof mcp.platform.career.employees.updateBulk>[0];
      type UpdateBulkData = Parameters<typeof mcp.platform.career.employees.updateBulk>[1];

      const filterPayload: UpdateBulkPayload = { query: mongoQuery } as UpdateBulkPayload;
      const safePayload = updatePayload as UpdateBulkData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const totalCount = await mcp.platform.career.employees.updateBulk(filterPayload, safePayload, { headers });

      logger('=== 3. RAW DB OUTPUT === : %s', totalCount);

      const safeData = z.object({ count: z.number().optional() }).parse({ count: totalCount });

      return {
        structuredContent: safeData,
        content: [{ type: 'text', text: `${safeData.count} employee(s) were successfully updated.` }],
      };
    }),
);

// ------------------------------------------------
// Update Single Career Employee By Id
// ------------------------------------------------
mcp.server.registerTool(
  'update_career_employee_by_id',
  {
    title: 'Update Career Employee By Id',
    description: `[ACTION] Updates (patches) an existing Career Employee by its exact MongoDB ObjectId.
      [TRIGGER] Use ONLY when the user explicitly asks to update, modify, edit, or change an existing employee.
      [RULES]
      1. NO HALLUCINATION: NEVER guess or invent 'id' or 'ref'.
      2. CHAINING: If the exact ID is unknown (e.g., "Update the senior developer"), you MUST use 'find_career_employee' first to retrieve it.
      3. PARTIAL UPDATE: Only provide the fields that actually need to be changed. Leave other fields empty.
      [DICTIONARY] ${CORE_DATA_DICTIONARY}, ${EMPLOYEE_DATA_DICTIONARY}
      [CONTEXT] MUST read "docs://schemas/core" before use.`
      .replace(/\s+/g, ' ')
      .trim(),
    inputSchema: {
      id: z.string().trim().min(1).describe('REQUIRED. Exact MongoDB ObjectId of the employee to update. Do not guess.'),
      // Merge Employee + Core schemas and make every field OPTIONAL for patching
      ...z
        .object({
          ...EMPLOYEE_INPUT_SCHEMA_FIELDS,
          ...CORE_INPUT_SCHEMA_FIELDS,
        })
        .partial().shape,
    },
    outputSchema: {
      ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS,
      ...CORE_OUTPUT_SCHEMA_FIELDS,
      // Error response fields (returned by throwableToolCall on failure)
      status: z.any().optional(),
      data: z.any().optional(),
      message: z.string().optional(),
    },
  },
  async (data, { requestInfo }) =>
    throwableToolCall(async () => {
      const logger = mcp.log('update_career_employee_by_id');
      const headers = getHeaders({ requestInfo });

      logger('=== 1. LLM INPUT === : %j', data);

      // Separate 'id' and 'ref' from the actual update payload
      const { id, ref, ...updatePayload } = data;

      // Extract exact SDK type for config to enforce compile-time safety
      type UpdateByIdConfig = Parameters<typeof mcp.platform.career.employees.updateById>[2];
      const config: UpdateByIdConfig = {
        headers,
        ...(ref && { params: { ref } }),
      };

      // Using 'as' here is safe because Zod has already validated the shape of the payload
      type UpdateByIdData = Parameters<typeof mcp.platform.career.employees.updateById>[1];
      const safePayload = updatePayload as UpdateByIdData;

      logger('=== 2. EXTRACTED PAYLOAD === : %j', safePayload);

      const updatedEmployee = await mcp.platform.career.employees.updateById(id, safePayload, config);

      logger('=== 3. RAW DB OUTPUT === : %j', updatedEmployee);

      const fixedUpdatedEmployee = fixOut(updatedEmployee);
      const schema = z.object({
        ...EMPLOYEE_OUTPUT_SCHEMA_FIELDS,
        ...CORE_OUTPUT_SCHEMA_FIELDS,
      });
      const safeData = schema.parse(fixedUpdatedEmployee);

      logger('=== 4. FINAL MCP RESPONSE === : %j', safeData);

      return {
        structuredContent: safeData,
        content: [
          {
            type: 'text',
            text: `Employee with ID "${id}" was successfully updated.`,
          },
        ],
      };
    }),
);
