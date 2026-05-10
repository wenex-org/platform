import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { StatKey, StatType } from '@app/common/enums/special';
import { z } from 'zod';

const STAT_SCHEMA = {
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

registerCollectionTools({
  service: 'special',
  collection: 'stats',
  entityName: 'SpecialStat',
  serviceDoc: 'docs://service/special-specification',
  inputSchema: { ...STAT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...STAT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.special.stats,
});
