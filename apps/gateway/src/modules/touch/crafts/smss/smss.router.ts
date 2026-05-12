import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { SmsProvider, SmsType } from '@app/common/enums/touch';
import { Sms } from '@app/common/interfaces/touch';
import { z, ZodType } from 'zod';

type SmsSchema = Record<keyof Sms, ZodType>;
const SMS_SCHEMA: Partial<SmsSchema> = {
  provider: z.nativeEnum(SmsProvider),

  type: z.nativeEnum(SmsType).optional(),

  message: z.string().optional(),
  template: z.string().optional(),
  parameters: z.array(z.string()).optional(),
  receptors: z.array(z.string()),
  sender: z.string().optional(),
  res: z.any().optional(),
};

const SMS_INPUT_SCHEMA: Partial<SmsSchema> = { ...SMS_SCHEMA, ...CORE_INPUT_SCHEMA };
const SMS_OUTPUT_SCHEMA: Partial<SmsSchema> = { ...SMS_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'touch',
  collection: 'smss',
  entityName: 'TouchSms',
  inputSchema: SMS_INPUT_SCHEMA,
  outputSchema: SMS_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/touch-specification',
  getRestfulService: (platform) => platform.touch.smss,
});
