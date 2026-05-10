import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ConfigKey } from '@app/common/enums/context';
import { Status } from '@app/common/core/enums';
import { z } from 'zod';

const CONFIG_SCHEMA = {
  key: z.nativeEnum(ConfigKey),
  eid: z.string(),
  value: z.any().optional(),
  status: z.nativeEnum(Status).optional(),
};

registerCollectionTools({
  service: 'context',
  collection: 'configs',
  entityName: 'ContextConfig',
  serviceDoc: 'docs://service/context-specification',
  inputSchema: { ...CONFIG_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...CONFIG_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.context.configs,
});
