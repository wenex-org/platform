import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { BranchType } from '@app/common/enums/career';
import { State, Status } from '@app/common/core/enums';
import { z } from 'zod';

const BRANCH_SCHEMA = {
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

registerCollectionTools({
  service: 'career',
  collection: 'branches',
  entityName: 'CareerBranch',
  serviceDoc: 'docs://service/career-specification',
  inputSchema: { ...BRANCH_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...BRANCH_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.career.branches,
});
