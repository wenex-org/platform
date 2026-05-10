import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ActivityType } from '@app/common/enums/general';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const ACTIVITY_SCHEMA = {
  type: z.nativeEnum(ActivityType),
  state: z.nativeEnum(State).optional(),
  source: z.string().optional(),
  message: z.string(),
  details: z.any().optional(),
  metadata: z.any().optional(),
};

registerCollectionTools({
  service: 'general',
  collection: 'activities',
  entityName: 'GeneralActivity',
  serviceDoc: 'docs://service/general-specification',
  inputSchema: { ...ACTIVITY_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...ACTIVITY_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.general.activities,
});
