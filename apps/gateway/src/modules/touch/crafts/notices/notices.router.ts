import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { NoticeType } from '@app/common/enums/touch';
import { z } from 'zod';

const ACTION_SCHEMA = {
  label: z.string(),
  type: z.string().optional(),
  path: z.string().optional(),
  icon: z.string().optional(),
};

const NOTICE_SCHEMA = {
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

registerCollectionTools({
  service: 'touch',
  collection: 'notices',
  entityName: 'TouchNotice',
  serviceDoc: 'docs://service/touch-specification',
  inputSchema: { ...NOTICE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...NOTICE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.touch.notices,
});
