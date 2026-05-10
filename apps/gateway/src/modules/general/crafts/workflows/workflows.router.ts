import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { WorkflowStatus } from '@app/common/enums/general';
import { z } from 'zod';

const STATE_SCHEMA = {
  ref: z.string(),
  name: z.string().optional(),
  status: z.nativeEnum(WorkflowStatus),
  value: z.any().optional(),
};

const TOKEN_SCHEMA = {
  id: z.string(),
  parent: z.string().optional(),
  locked: z.boolean().optional(),
  history: z.array(z.object(STATE_SCHEMA)),
};

const WORKFLOW_SCHEMA = {
  name: z.string(),
  status: z.nativeEnum(WorkflowStatus),
  tokens: z.array(z.object(TOKEN_SCHEMA)),
  data: z.any().optional(),
};

registerCollectionTools({
  service: 'general',
  collection: 'workflows',
  entityName: 'GeneralWorkflow',
  serviceDoc: 'docs://service/general-specification',
  inputSchema: { ...WORKFLOW_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...WORKFLOW_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.general.workflows,
});
