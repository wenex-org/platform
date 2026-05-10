import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { EmailProvider } from '@app/common/enums/touch';
import { z } from 'zod';

const SMTP_SCHEMA = {
  response: z.string(),
  accepted: z.array(z.string()).optional(),
  rejected: z.array(z.string()).optional(),
  message_id: z.string(),
  message_time: z.number(),
  message_size: z.number(),
};

const EMAIL_SCHEMA = {
  provider: z.nativeEnum(EmailProvider),
  to: z.array(z.string()),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  from: z.string(),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string().optional(),
  date: z.string().optional(),
  reply_to: z.array(z.string()).optional(),
  in_reply_to: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  smtp: z.object(SMTP_SCHEMA).optional(),
};

registerCollectionTools({
  service: 'touch',
  collection: 'emails',
  entityName: 'TouchEmail',
  serviceDoc: 'docs://service/touch-specification',
  inputSchema: { ...EMAIL_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...EMAIL_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.touch.emails,
});
