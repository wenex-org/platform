import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { SagaState } from '@app/common/enums/essential';
import { Saga } from '@app/common/interfaces/essential';
import { z, ZodType } from 'zod';

type SagaSchema = Record<keyof Saga, ZodType>;
const SAGA_SCHEMA: Partial<SagaSchema> = {
  ttl: z.number(),
  job: z.string(),

  state: z.nativeEnum(SagaState),
  session: z.string(),

  pruned_at: z.string().optional(),
  aborted_at: z.string().optional(),
  committed_at: z.string().optional(),
};

const SAGA_INPUT_SCHEMA: Partial<SagaSchema> = { ...SAGA_SCHEMA, ...CORE_INPUT_SCHEMA };
const SAGA_OUTPUT_SCHEMA: Partial<SagaSchema> = { ...SAGA_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'essential',
  collection: 'sagas',
  entityName: 'EssentialSaga',
  inputSchema: SAGA_INPUT_SCHEMA,
  outputSchema: SAGA_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/essential-specification',
  getRestfulService: (platform) => platform.essential.sagas,
});
