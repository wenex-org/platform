import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Workflow, WorkflowState, WorkflowToken } from '@app/common/interfaces/general';
import { WorkflowStatus } from '@app/common/enums/general';
import { z, ZodType } from 'zod';

const STATE_SCHEMA: Record<keyof WorkflowState, ZodType> = {
  ref: z.string(),
  name: z.string().optional(),
  status: z.nativeEnum(WorkflowStatus),
  value: z.any().optional(),
};

const TOKEN_SCHEMA: Record<keyof WorkflowToken, ZodType> = {
  id: z.string(),
  parent: z.string().optional(),
  locked: z.boolean().optional(),
  history: z.array(z.object(STATE_SCHEMA)),
};

type WorkflowSchema = Record<keyof Workflow, ZodType>;
const WORKFLOW_SCHEMA: Partial<WorkflowSchema> = {
  name: z.string(),

  status: z.nativeEnum(WorkflowStatus),
  tokens: z.array(z.object(TOKEN_SCHEMA)),

  data: z.any().optional(),
};

const WORKFLOW_INPUT_SCHEMA: Partial<WorkflowSchema> = { ...WORKFLOW_SCHEMA, ...CORE_INPUT_SCHEMA };
const WORKFLOW_OUTPUT_SCHEMA: Partial<WorkflowSchema> = { ...WORKFLOW_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'general',
  collection: 'workflows',
  entityName: 'GeneralWorkflow',
  inputSchema: WORKFLOW_INPUT_SCHEMA,
  outputSchema: WORKFLOW_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/general-specification',
  getRestfulService: (platform) => platform.general.workflows,
});
