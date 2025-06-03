import { ELASTIC_CONFIG, MONGO_CONFIG, MONGO_OPTIONS } from '@app/common/core/envs';
import { ElasticModule, ElasticService } from '@app/command/database/elastic';
import { MongoModule, MongoService } from '@app/command/database/mongo';
import { Post, PostDto } from '@wenex/sdk/common/interfaces/content';
import { EXPECT_CORE_SCHEMA, Login } from '@app/common/core/e2e';
import { Serializer } from '@wenex/sdk/common/core/interfaces';
import { PostStatus } from '@wenex/sdk/common/enums/content';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PostsService } from '@wenex/sdk';

describe('Content: PostsController (e2e)', () => {
  let app: INestApplication;
  let service: PostsService;

  beforeAll(async () => {
    const platform = await Login.as('user');
    service = platform.content.posts;

    // Command Tools
    const module: TestingModule = await Test.createTestingModule({
      imports: [ElasticModule.register(ELASTIC_CONFIG()), MongoModule.register(MONGO_CONFIG(), MONGO_OPTIONS())],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Common Tests', () => {
    beforeAll(async () => {
      await app.get(ElasticService).delete({ index: ['post'] });
      await app.get(MongoService).reset({ collection: ['e2e-content/posts'] });
    });

    afterAll(async () => {
      await app.get(ElasticService).delete({ index: ['post'] });
      await app.get(MongoService).reset({ collection: ['e2e-content/posts'] });
    });

    let post: Serializer<Post>;
    let posts: Serializer<Post>[];

    const payload: PostDto = {
      title: 'Test Post',
      status: PostStatus.DRAFT,
      content: 'This is a test post.',
    };

    it('create', async () => {
      post = await service.create(payload);
      expect(post).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });
    });

    it('createBulk', async () => {
      posts = await service.createBulk({ items: [payload] });
      expect(posts).toStrictEqual(expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]));
    });

    it('count', async () => {
      expect(await service.count({})).toBe(posts.length + 1);
    });

    it('find', async () => {
      expect(await service.find({ query: {} })).toStrictEqual(
        expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]),
      );
    });

    it('findById', async () => {
      expect(await service.findById(post.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });
    });

    it('updateById', async () => {
      payload.title = 'Modified Title';
      expect(await service.updateById(post.id!, { title: 'Modified Title' })).toStrictEqual({
        ...payload,
        ...EXPECT_CORE_SCHEMA(['UPDATED']),
      });
    });

    it('updateBulk', async () => {
      payload.status = PostStatus.PUBLISHED;
      expect(await service.updateBulk(payload, {})).toBe(posts.length + 1);
    });

    it('deleteById', async () => {
      expect(await service.deleteById(post.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'DELETED']) });
    });

    it('restoreById', async () => {
      expect(await service.restoreById(post.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'RESTORED']) });
    });
  });
});
