import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Email, EmailSmtp } from '@app/common/interfaces/touch';
import { EmailProvider } from '@app/common/enums/touch';
import { z, ZodType } from 'zod';

const SMTP_SCHEMA: Record<keyof EmailSmtp, ZodType> = {
  response: z.string(),
  accepted: z.array(z.string()).optional(),
  rejected: z.array(z.string()).optional(),

  message_id: z.string(),
  message_time: z.number(),
  message_size: z.number(),
};

type EmailSchema = Record<keyof Email, ZodType>;
const EMAIL_SCHEMA: Partial<EmailSchema> = {
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

const EMAIL_INPUT_SCHEMA: Partial<EmailSchema> = { ...EMAIL_SCHEMA, ...CORE_INPUT_SCHEMA };
const EMAIL_OUTPUT_SCHEMA: Partial<EmailSchema> = { ...EMAIL_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'touch',
  collection: 'emails',
  entityName: 'TouchEmail',
  inputSchema: EMAIL_INPUT_SCHEMA,
  outputSchema: EMAIL_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/touch-specification',
  getRestfulService: (platform) => platform.touch.emails,
});
