import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Activity } from '@app/common/interfaces/general';
import { ActivityType } from '@app/common/enums/general';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type ActivitySchema = Record<keyof Activity, ZodType>;
const ACTIVITY_SCHEMA: Partial<ActivitySchema> = {
  type: z.nativeEnum(ActivityType),
  state: z.nativeEnum(State).optional(),
  source: z.string().optional(),

  message: z.string(),
  details: z.any().optional(),
  metadata: z.any().optional(),
};

const ACTIVITY_INPUT_SCHEMA: Partial<ActivitySchema> = { ...ACTIVITY_SCHEMA, ...CORE_INPUT_SCHEMA };
const ACTIVITY_OUTPUT_SCHEMA: Partial<ActivitySchema> = { ...ACTIVITY_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'general',
  collection: 'activities',
  entityName: 'GeneralActivity',
  inputSchema: ACTIVITY_INPUT_SCHEMA,
  outputSchema: ACTIVITY_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/general-specification',
  getRestfulService: (platform) => platform.general.activities,
});
