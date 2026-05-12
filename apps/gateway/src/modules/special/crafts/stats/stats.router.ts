import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { StatKey, StatType } from '@app/common/enums/special';
import { Stat } from '@app/common/interfaces/special';
import { z, ZodType } from 'zod';

type StatSchema = Record<keyof Stat, ZodType>;
const STAT_SCHEMA: Partial<StatSchema> = {
  type: z.nativeEnum(StatType),
  key: z.nativeEnum(StatKey),

  obj: z.any().optional(),
  flag: z.any().optional(),

  day: z.number().optional(),
  month: z.number().optional(),
  year: z.number(),

  hours: z.array(z.number()).optional(),
  days: z.array(z.number()).optional(),
  months: z.array(z.number()).optional(),
};

const STAT_INPUT_SCHEMA: Partial<StatSchema> = { ...STAT_SCHEMA, ...CORE_INPUT_SCHEMA };
const STAT_OUTPUT_SCHEMA: Partial<StatSchema> = { ...STAT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'special',
  collection: 'stats',
  entityName: 'SpecialStat',
  inputSchema: STAT_INPUT_SCHEMA,
  outputSchema: STAT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/special-specification',
  getRestfulService: (platform) => platform.special.stats,
});
