import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const METRIC_SCHEMA = {
  sensor: z.string(),
  key: z.string().optional(),
  state: z.nativeEnum(State).optional(),
  device: z.string().optional(),
  value: z.union([z.number(), z.array(z.number())]),
};

registerCollectionTools({
  service: 'thing',
  collection: 'metrics',
  entityName: 'ThingMetric',
  serviceDoc: 'docs://service/thing-specification',
  inputSchema: { ...METRIC_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...METRIC_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.thing.metrics,
});
