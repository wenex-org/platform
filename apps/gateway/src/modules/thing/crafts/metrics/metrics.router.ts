import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Metric } from '@app/common/interfaces/thing';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type MetricSchema = Record<keyof Metric, ZodType>;
const METRIC_SCHEMA: Partial<MetricSchema> = {
  sensor: z.string(),
  key: z.string().optional(),

  state: z.nativeEnum(State).optional(),

  device: z.string().optional(),
  value: z.union([z.number(), z.array(z.number())]),
};

const METRIC_INPUT_SCHEMA: Partial<MetricSchema> = { ...METRIC_SCHEMA, ...CORE_INPUT_SCHEMA };
const METRIC_OUTPUT_SCHEMA: Partial<MetricSchema> = { ...METRIC_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'thing',
  collection: 'metrics',
  entityName: 'ThingMetric',
  inputSchema: METRIC_INPUT_SCHEMA,
  outputSchema: METRIC_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/thing-specification',
  getRestfulService: (platform) => platform.thing.metrics,
});
