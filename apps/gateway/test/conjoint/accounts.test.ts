import { Account, AccountDto } from '@wenex/sdk/common/interfaces/conjoint';
import { MongoModule, MongoService } from '@app/command/database/mongo';
import { MONGO_CONFIG, MONGO_OPTIONS } from '@app/common/core/envs';
import { EXPECT_CORE_SCHEMA, Login } from '@app/common/core/e2e';
import { AccountType } from '@wenex/sdk/common/enums/conjoint';
import { Serializer } from '@wenex/sdk/common/core/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Conjoint } from '@wenex/sdk';

describe('Conjoint: AccountsController (e2e)', () => {
  let app: INestApplication;
  let service: Conjoint.AccountsService;

  beforeAll(async () => {
    const platform = await Login.as('user');
    service = platform.conjoint.accounts;

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

  describe('Common Tests', () => {
    beforeAll(async () => {
      await app.get(MongoService).reset({ collection: ['e2e-conjoint/accounts'] });
    });

    afterAll(async () => {
      await app.get(MongoService).reset({ collection: ['e2e-conjoint/accounts'] });
    });

    let account: Serializer<Account>;
    let accounts: Serializer<Account>[];

    const payload: AccountDto = { type: AccountType.ROBOT };

    it('create', async () => {
      account = await service.create(payload);
      expect(account).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });
    });

    it('createBulk', async () => {
      accounts = await service.createBulk({ items: [payload] });
      expect(accounts).toStrictEqual(expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]));
    });

    it('count', async () => {
      expect(await service.count({})).toBe(accounts.length + 1);
    });

    it('find', async () => {
      expect(await service.find({ query: {} })).toStrictEqual(
        expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]),
      );
    });

    it('findById', async () => {
      expect(await service.findById(account.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });
    });

    it('updateById', async () => {
      payload.description = 'Update By ID Test';
      expect(await service.updateById(account.id!, { description: 'Update By ID Test' })).toStrictEqual({
        ...payload,
        ...EXPECT_CORE_SCHEMA(['UPDATED']),
      });
    });

    it('updateBulk', async () => {
      payload.description = 'Update Bulk Test';
      expect(await service.updateBulk(payload, {})).toBe(accounts.length + 1);
    });

    it('deleteById', async () => {
      expect(await service.deleteById(account.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'DELETED']) });
    });

    it('restoreById', async () => {
      expect(await service.restoreById(account.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'RESTORED']) });
    });
  });
});
