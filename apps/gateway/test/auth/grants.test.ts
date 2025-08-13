import { MongoModule, MongoService } from '@app/command/database/mongo';
import { MONGO_CONFIG, MONGO_OPTIONS } from '@app/common/core/envs';
import { EXPECT_CORE_SCHEMA, Login } from '@app/common/core/e2e';
import { GrantDto } from '@wenex/sdk/common/interfaces/auth';
import { ROOT_DOMAIN } from '@app/common/core/constants';
import { subject } from '@wenex/sdk/common/utils/auth';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Auth } from '@wenex/sdk';

describe('Auth: GrantsController (e2e)', () => {
  let app: INestApplication;
  let service: Auth.GrantsService;

  beforeAll(async () => {
    const platform = await Login.as('user');
    service = platform.auth.grants;

    // Command Tools
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongoModule.register(MONGO_CONFIG(), MONGO_OPTIONS())],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.get(MongoService).reset({ collection: ['e2e-auth/grants'] });
  });

  afterEach(async () => {
    await app.get(MongoService).reset({ collection: ['e2e-auth/grants'] });
  });

  test('Common Tests', async () => {
    const payload: GrantDto = { subject: subject('foo', ROOT_DOMAIN), action: 'read', object: 'bar' };

    // create
    const grant = await service.create(payload);
    expect(grant).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });

    // createBulk
    const grants = await service.createBulk({ items: [payload] });
    expect(grants).toStrictEqual(expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]));

    // count
    expect(await service.count({})).toBe(grants.length + 1 + 1); // +1 for the initial grant created

    // find
    const find = await service.find({ query: {} });
    expect(find).toStrictEqual(expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]));

    // findById
    expect(await service.findById(grant.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });

    // updateById
    payload.description = 'Update By ID Test';
    const result = await service.updateById(grant.id!, { description: 'Update By ID Test' });
    expect(result).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED']) });

    // updateBulk
    payload.props = { message: 'Update Bulk Test' };
    expect(await service.updateBulk(payload, {})).toBe(grants.length + 1 + 1); // +1 for the initial grant created

    // deleteById
    expect(await service.deleteById(grant.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'DELETED']) });

    // restoreById
    expect(await service.restoreById(grant.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'RESTORED']) });

    // destroyById
    expect(await service.restoreById(grant.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'RESTORED']) });
  });
});
