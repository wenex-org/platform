import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Status, ValueType } from '@app/common/core/enums';
import { z } from 'zod';

const SETTING_SCHEMA = {
  key: z.string(),
  type: z.nativeEnum(ValueType),
  value: z.any().optional(),
  status: z.nativeEnum(Status).optional(),
};

registerCollectionTools({
  service: 'context',
  collection: 'settings',
  entityName: 'ContextSetting',
  serviceDoc: 'docs://service/context-specification',
  inputSchema: { ...SETTING_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...SETTING_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.context.settings,
});
