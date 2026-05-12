import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { EmployeeType, LocationRange } from '@app/common/enums/career';
import { Employee } from '@app/common/interfaces/career';
import { State, Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

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

registerCollectionTools({
  service: 'career',
  collection: 'employees',
  entityName: 'CareerEmployee',
  inputSchema: EMPLOYEE_INPUT_SCHEMA,
  outputSchema: EMPLOYEE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.employees,
});
