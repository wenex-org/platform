import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, REACTION_SCHEMA } from '@app/common/core/mcp';
import { Message } from '@app/common/interfaces/conjoint';
import { MessageType } from '@app/common/enums/conjoint';
import { z, ZodType } from 'zod';

type MessageSchema = Record<keyof Message, ZodType>;
const MESSAGE_SCHEMA: Partial<MessageSchema> = {
  type: z.nativeEnum(MessageType),

  content: z.any(),

  caption: z.string().optional(),
  channel: z.string().optional(),
  account: z.string().optional(),

  mentions: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),

  reply_to: z.string().optional(),

  edited_at: z.string().optional(),
  delivered_at: z.string().optional(),
  scheduled_at: z.string().optional(),

  views: z.number().optional(),
  visited_at: z.string().optional(),

  originate_from: z.string().optional(),
  forwarded_from: z.string().optional(),

  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

const MESSAGE_INPUT_SCHEMA: Partial<MessageSchema> = { ...MESSAGE_SCHEMA, ...CORE_INPUT_SCHEMA };
const MESSAGE_OUTPUT_SCHEMA: Partial<MessageSchema> = { ...MESSAGE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'conjoint',
  collection: 'messages',
  entityName: 'ConjointMessage',
  inputSchema: MESSAGE_INPUT_SCHEMA,
  outputSchema: MESSAGE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/conjoint-specification',
  getRestfulService: (platform) => platform.conjoint.messages,
});
