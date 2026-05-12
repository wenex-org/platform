import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA, REACTION_SCHEMA } from '@app/common/core/mcp';
import { PostStatus } from '@app/common/enums/content';
import { Post } from '@app/common/interfaces/content';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type PostSchema = Record<keyof Post, ZodType>;
const POST_SCHEMA: Partial<PostSchema> = {
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

const POST_INPUT_SCHEMA: Partial<PostSchema> = { ...POST_SCHEMA, ...CORE_INPUT_SCHEMA };
const POST_OUTPUT_SCHEMA: Partial<PostSchema> = { ...POST_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'content',
  collection: 'posts',
  entityName: 'ContentPost',
  inputSchema: POST_INPUT_SCHEMA,
  outputSchema: POST_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/content-specification',
  getRestfulService: (platform) => platform.content.posts,
});
