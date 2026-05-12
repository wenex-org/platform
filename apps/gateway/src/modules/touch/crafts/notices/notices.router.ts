import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Notice, NoticeAction } from '@app/common/interfaces/touch';
import { NoticeType } from '@app/common/enums/touch';
import { z, ZodType } from 'zod';

const ACTION_SCHEMA: Record<keyof NoticeAction, ZodType> = {
  label: z.string(),
  type: z.string().optional(),
  path: z.string().optional(),
  icon: z.string().optional(),
};

type NoticeSchema = Record<keyof Notice, ZodType>;
const NOTICE_SCHEMA: Partial<NoticeSchema> = {
  type: z.nativeEnum(NoticeType),

  title: z.string(),
  subtitle: z.string().optional(),

  content: z.string(),
  category: z.string().optional(),

  visited: z.boolean().optional(),
  visited_at: z.string().optional(),
  visited_by: z.string().optional(),
  visited_in: z.string().optional(),

  thumbnail: z.string().optional(),
  attachments: z.array(z.any()).optional(),

  actions: z.array(z.object(ACTION_SCHEMA)).optional(),
};

const NOTICE_INPUT_SCHEMA: Partial<NoticeSchema> = { ...NOTICE_SCHEMA, ...CORE_INPUT_SCHEMA };
const NOTICE_OUTPUT_SCHEMA: Partial<NoticeSchema> = { ...NOTICE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'touch',
  collection: 'notices',
  entityName: 'TouchNotice',
  inputSchema: NOTICE_INPUT_SCHEMA,
  outputSchema: NOTICE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/touch-specification',
  getRestfulService: (platform) => platform.touch.notices,
});
