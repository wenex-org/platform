import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State, Status } from '@app/common/core/enums';
import { Branch } from '@app/common/interfaces/career';
import { BranchType } from '@app/common/enums/career';
import { z, ZodType } from 'zod';

type BranchSchema = Record<keyof Branch, ZodType>;
const BRANCH_SCHEMA: Partial<BranchSchema> = {
  type: z.nativeEnum(BranchType),

  name: z.string().optional(),
  business: z.string(),

  code: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status),

  rate: z.number(),
  votes: z.number().optional(),
  rating: z.number().optional(),

  parent: z.string().optional(),
  manager: z.string().optional(),

  location: z.string(),

  phone: z.string().optional(),
  address: z.string().optional(),

  opening_date: z.string().optional(),
};

const BRANCH_INPUT_SCHEMA: Partial<BranchSchema> = { ...BRANCH_SCHEMA, ...CORE_INPUT_SCHEMA };
const BRANCH_OUTPUT_SCHEMA: Partial<BranchSchema> = { ...BRANCH_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'career',
  collection: 'branches',
  entityName: 'CareerBranch',
  inputSchema: BRANCH_INPUT_SCHEMA,
  outputSchema: BRANCH_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/career-specification',
  getRestfulService: (platform) => platform.career.branches,
});
