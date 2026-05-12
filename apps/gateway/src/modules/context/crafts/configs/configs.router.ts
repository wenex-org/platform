import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Config } from '@app/common/interfaces/context';
import { ConfigKey } from '@app/common/enums/context';
import { Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type ConfigSchema = Record<keyof Config, ZodType>;
const CONFIG_SCHEMA: Partial<ConfigSchema> = {
  key: z.nativeEnum(ConfigKey),
  eid: z.string(),
  value: z.any().optional(),
  status: z.nativeEnum(Status).optional(),
};

const CONFIG_INPUT_SCHEMA: Partial<ConfigSchema> = { ...CONFIG_SCHEMA, ...CORE_INPUT_SCHEMA };
const CONFIG_OUTPUT_SCHEMA: Partial<ConfigSchema> = { ...CONFIG_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'context',
  collection: 'configs',
  entityName: 'ContextConfig',
  inputSchema: CONFIG_INPUT_SCHEMA,
  outputSchema: CONFIG_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/context-specification',
  getRestfulService: (platform) => platform.context.configs,
});
