import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { LocationGeometryType, LocationType } from '@app/common/enums/logistic';
import { z } from 'zod';

const GEOMETRY_SCHEMA = {
  type: z.nativeEnum(LocationGeometryType),
  coordinates: z.array(z.any()),
  bbox: z.array(z.number()).optional(),
};

const LOCATION_SCHEMA = {
  name: z.string().optional(),
  title: z.string().optional(),
  type: z.nativeEnum(LocationType).optional(),
  geometry: z.object(GEOMETRY_SCHEMA),
  properties: z.any().optional(),
};

registerCollectionTools({
  service: 'logistic',
  collection: 'locations',
  entityName: 'LogisticLocation',
  serviceDoc: 'docs://service/logistic-specification',
  inputSchema: { ...LOCATION_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...LOCATION_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.logistic.locations,
});
