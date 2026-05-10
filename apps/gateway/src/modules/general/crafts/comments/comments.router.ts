import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, REACTION_SCHEMA } from '@app/common/core/mcp';
import { CommentStatus } from '@app/common/enums/general';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const COMMENT_SCHEMA = {
  type: z.string().optional(),
  post: z.string().optional(),
  ticket: z.string().optional(),
  content: z.string(),
  level: z.number().optional(),
  parent: z.string().optional(),
  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(CommentStatus).optional(),
  visibility: z.string().optional(),
  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),
  views: z.number().optional(),
  loves: z.number().optional(),
  likes: z.number().optional(),
  dislikes: z.number().optional(),
  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

registerCollectionTools({
  service: 'general',
  collection: 'comments',
  entityName: 'GeneralComment',
  serviceDoc: 'docs://service/general-specification',
  inputSchema: { ...COMMENT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...COMMENT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.general.comments,
});
