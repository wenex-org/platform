import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, REACTION_SCHEMA } from '@app/common/core/mcp';
import { MessageType } from '@app/common/enums/conjoint';
import { z } from 'zod';

const MESSAGE_SCHEMA = {
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

registerCollectionTools({
  service: 'conjoint',
  collection: 'messages',
  entityName: 'ConjointMessage',
  serviceDoc: 'docs://service/conjoint-specification',
  inputSchema: { ...MESSAGE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...MESSAGE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.conjoint.messages,
});
