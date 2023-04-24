import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

describe('LocationsController', () => {
  let locationsController: LocationsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [LocationsService],
    }).compile();

    locationsController = app.get<LocationsController>(LocationsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(locationsController.getHello()).toBe('Hello World!');
    });
  });
});
