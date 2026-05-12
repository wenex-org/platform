import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { LocationGeometryType, LocationType } from '@app/common/enums/logistic';
import { Location, LocationGeometry } from '@app/common/interfaces/logistic';
import { z, ZodType } from 'zod';

const GEOMETRY_SCHEMA: Record<keyof LocationGeometry, ZodType> = {
  type: z.nativeEnum(LocationGeometryType),
  coordinates: z.array(z.any()),
  bbox: z.array(z.number()).optional(),
};

type LocationSchema = Record<keyof Location, ZodType>;
const LOCATION_SCHEMA: Partial<LocationSchema> = {
  name: z.string().optional(),
  title: z.string().optional(),

  type: z.nativeEnum(LocationType).optional(),
  geometry: z.object(GEOMETRY_SCHEMA),
  properties: z.any().optional(),
};

const LOCATION_INPUT_SCHEMA: Partial<LocationSchema> = { ...LOCATION_SCHEMA, ...CORE_INPUT_SCHEMA };
const LOCATION_OUTPUT_SCHEMA: Partial<LocationSchema> = { ...LOCATION_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'logistic',
  collection: 'locations',
  entityName: 'LogisticLocation',
  inputSchema: LOCATION_INPUT_SCHEMA,
  outputSchema: LOCATION_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/logistic-specification',
  getRestfulService: (platform) => platform.logistic.locations,
});
