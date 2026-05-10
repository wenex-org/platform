import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, REACTION_SCHEMA } from '@app/common/core/mcp';
import { PostStatus } from '@app/common/enums/content';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const POST_SCHEMA = {
  title: z.string(),
  type: z.string().optional(),
  slug: z.string().optional(),
  subtitle: z.string().optional(),
  parent: z.string().optional(),
  content: z.string(),
  summary: z.string().optional(),
  categories: z.array(z.string()).optional(),
  state: z.nativeEnum(State),
  status: z.nativeEnum(PostStatus),
  visibility: z.string().optional(),
  rate: z.number().optional(),
  votes: z.number().optional(),
  rating: z.number().optional(),
  views: z.number().optional(),
  loves: z.number().optional(),
  likes: z.number().optional(),
  dislikes: z.number().optional(),
  thumbnail: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  featured_image: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  related_posts: z.array(z.string()).optional(),
  publication_date: z.string().optional(),
  reactions: z.array(z.object(REACTION_SCHEMA)).optional(),
};

registerCollectionTools({
  service: 'content',
  collection: 'posts',
  entityName: 'ContentPost',
  serviceDoc: 'docs://service/content-specification',
  inputSchema: { ...POST_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...POST_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.content.posts,
});
