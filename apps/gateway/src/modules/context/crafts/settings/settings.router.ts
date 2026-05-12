import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Status, ValueType } from '@app/common/core/enums';
import { Setting } from '@app/common/interfaces/context';
import { z, ZodType } from 'zod';

type SettingSchema = Record<keyof Setting, ZodType>;
const SETTING_SCHEMA: Partial<SettingSchema> = {
  key: z.string(),
  type: z.nativeEnum(ValueType),
  value: z.any().optional(),
  status: z.nativeEnum(Status).optional(),
};

const SETTING_INPUT_SCHEMA: Partial<SettingSchema> = { ...SETTING_SCHEMA, ...CORE_INPUT_SCHEMA };
const SETTING_OUTPUT_SCHEMA: Partial<SettingSchema> = { ...SETTING_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'context',
  collection: 'settings',
  entityName: 'ContextSetting',
  inputSchema: SETTING_INPUT_SCHEMA,
  outputSchema: SETTING_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/context-specification',
  getRestfulService: (platform) => platform.context.settings,
});
