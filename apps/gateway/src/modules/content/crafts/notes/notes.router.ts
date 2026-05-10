import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, REACTION_SCHEMA } from '@app/common/core/mcp';
import { NoteType } from '@app/common/enums/content';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const NOTE_SCHEMA = {
  type: z.nativeEnum(NoteType),
  state: z.nativeEnum(State).optional(),
  status: z.string().optional(),
  content: z.string(),
  level: z.number().optional(),
  parent: z.string().optional(),
  relation: z.string().optional(),
  visibility: z.string().optional(),
  loves: z.number().optional(),
  likes: z.number().optional(),
  dislikes: z.number().optional(),
  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

registerCollectionTools({
  service: 'content',
  collection: 'notes',
  entityName: 'ContentNote',
  serviceDoc: 'docs://service/content-specification',
  inputSchema: { ...NOTE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...NOTE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.content.notes,
});
