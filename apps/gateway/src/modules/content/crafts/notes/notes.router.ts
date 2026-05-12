import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, REACTION_SCHEMA } from '@app/common/core/mcp';
import { Note } from '@app/common/interfaces/content';
import { NoteType } from '@app/common/enums/content';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type NoteSchema = Record<keyof Note, ZodType>;
const NOTE_SCHEMA: Partial<NoteSchema> = {
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

const NOTE_INPUT_SCHEMA: Partial<NoteSchema> = { ...NOTE_SCHEMA, ...CORE_INPUT_SCHEMA };
const NOTE_OUTPUT_SCHEMA: Partial<NoteSchema> = { ...NOTE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'content',
  collection: 'notes',
  entityName: 'ContentNote',
  inputSchema: NOTE_INPUT_SCHEMA,
  outputSchema: NOTE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/content-specification',
  getRestfulService: (platform) => platform.content.notes,
});
