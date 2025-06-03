import { Location, LocationDto } from '@wenex/sdk/common/interfaces/logistic';
import { MongoModule, MongoService } from '@app/command/database/mongo';
import { LocationGeometryType } from '@wenex/sdk/common/enums/logistic';
import { MONGO_CONFIG, MONGO_OPTIONS } from '@app/common/core/envs';
import { EXPECT_CORE_SCHEMA, Login } from '@app/common/core/e2e';
import { Serializer } from '@wenex/sdk/common/core/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LocationsService } from '@wenex/sdk';

describe('Logistic: LocationsController (e2e)', () => {
  let app: INestApplication;
  let service: LocationsService;

  beforeAll(async () => {
    const platform = await Login.as('user');
    service = platform.logistic.locations;

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
      await app.get(MongoService).reset({ collection: ['e2e-logistic/locations'] });
    });

    afterAll(async () => {
      await app.get(MongoService).reset({ collection: ['e2e-logistic/locations'] });
    });

    let location: Serializer<Location>;
    let locations: Serializer<Location>[];

    const payload: LocationDto = {
      geometry: {
        type: LocationGeometryType.Point,
        coordinates: [30.285875257153215, 57.06392780875093],
      },
    };

    it('create', async () => {
      location = await service.create(payload);
      expect(location).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });
    });

    it('createBulk', async () => {
      locations = await service.createBulk({ items: [payload] });
      expect(locations).toStrictEqual(expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]));
    });

    it('count', async () => {
      expect(await service.count({})).toBe(locations.length + 1);
    });

    it('find', async () => {
      expect(await service.find({ query: {} })).toStrictEqual(
        expect.arrayContaining([{ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) }]),
      );
    });

    it('findById', async () => {
      expect(await service.findById(location.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['CREATED']) });
    });

    it('updateById', async () => {
      payload.description = 'Update By ID Test';
      expect(await service.updateById(location.id!, { description: 'Update By ID Test' })).toStrictEqual({
        ...payload,
        ...EXPECT_CORE_SCHEMA(['UPDATED']),
      });
    });

    it('updateBulk', async () => {
      payload.description = 'Update Bulk Test';
      expect(await service.updateBulk(payload, {})).toBe(locations.length + 1);
    });

    it('deleteById', async () => {
      expect(await service.deleteById(location.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'DELETED']) });
    });

    it('restoreById', async () => {
      expect(await service.restoreById(location.id!)).toStrictEqual({ ...payload, ...EXPECT_CORE_SCHEMA(['UPDATED', 'RESTORED']) });
    });
  });

  describe('Specific Tests', () => {
    const [lat, lon] = [30.285875257153215, 57.06392780875093];

    const expected = {
      place: {
        name: expect.any(String),
        lat: expect.any(Number),
        lon: expect.any(Number),
        type: expect.any(String),
        category: expect.any(String),
        bbox: [expect.any(Number), expect.any(Number), expect.any(Number), expect.any(Number)],
      },
      address: {
        city: expect.any(String),
        county: expect.any(String),
        district: expect.any(String),
        country: expect.any(String),
      },
    };

    it('addressLookup', async () => {
      const result = await service.addressLookup({ lat, lon });
      expect(result).toMatchObject({ ...expected.place, address: expected.address });
    });

    it('geocodeLookup', async () => {
      const result = await service.geocodeLookup({ query: 'شهر کرمان' });
      expect(result).toMatchObject([{ ...expected.place }]);
    });
  });
});
