import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { SagaState } from '@app/common/enums/essential';
import { z } from 'zod';

const SAGA_SCHEMA = {
  ttl: z.number(),
  job: z.string(),
  state: z.nativeEnum(SagaState),
  session: z.string(),
  pruned_at: z.string().optional(),
  aborted_at: z.string().optional(),
  committed_at: z.string().optional(),
};

registerCollectionTools({
  service: 'essential',
  collection: 'sagas',
  entityName: 'EssentialSaga',
  serviceDoc: 'docs://service/essential-specification',
  inputSchema: { ...SAGA_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...SAGA_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.essential.sagas,
});
