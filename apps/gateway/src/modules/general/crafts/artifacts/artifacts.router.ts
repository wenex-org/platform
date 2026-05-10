import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ValueType } from '@app/common/core/enums';
import { z } from 'zod';

const ARTIFACT_SCHEMA = {
  key: z.string(),
  type: z.nativeEnum(ValueType),
  value: z.any().optional(),
};

registerCollectionTools({
  service: 'general',
  collection: 'artifacts',
  entityName: 'GeneralArtifact',
  serviceDoc: 'docs://service/general-specification',
  inputSchema: { ...ARTIFACT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...ARTIFACT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.general.artifacts,
});
