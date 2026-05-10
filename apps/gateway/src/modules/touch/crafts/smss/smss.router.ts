import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { SmsProvider, SmsType } from '@app/common/enums/touch';
import { z } from 'zod';

const SMS_SCHEMA = {
  provider: z.nativeEnum(SmsProvider),
  type: z.nativeEnum(SmsType).optional(),
  message: z.string().optional(),
  template: z.string().optional(),
  parameters: z.array(z.string()).optional(),
  receptors: z.array(z.string()),
  sender: z.string().optional(),
  res: z.any().optional(),
};

registerCollectionTools({
  service: 'touch',
  collection: 'smss',
  entityName: 'TouchSms',
  serviceDoc: 'docs://service/touch-specification',
  inputSchema: { ...SMS_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...SMS_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.touch.smss,
});
