import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Artifact } from '@app/common/interfaces/general';
import { ValueType } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type ArtifactSchema = Record<keyof Artifact, ZodType>;
const ARTIFACT_SCHEMA: Partial<ArtifactSchema> = {
  key: z.string(),
  type: z.nativeEnum(ValueType),
  value: z.any().optional(),
};

const ARTIFACT_INPUT_SCHEMA: Partial<ArtifactSchema> = { ...ARTIFACT_SCHEMA, ...CORE_INPUT_SCHEMA };
const ARTIFACT_OUTPUT_SCHEMA: Partial<ArtifactSchema> = { ...ARTIFACT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'general',
  collection: 'artifacts',
  entityName: 'GeneralArtifact',
  inputSchema: ARTIFACT_INPUT_SCHEMA,
  outputSchema: ARTIFACT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/general-specification',
  getRestfulService: (platform) => platform.general.artifacts,
});
