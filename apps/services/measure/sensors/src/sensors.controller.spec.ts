import { Test, TestingModule } from '@nestjs/testing';
import { SensorsController } from './sensors.controller';
import { SensorsService } from './sensors.service';

describe('SensorsController', () => {
  let sensorsController: SensorsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SensorsController],
      providers: [SensorsService],
    }).compile();

    sensorsController = app.get<SensorsController>(SensorsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sensorsController.getHello()).toBe('Hello World!');
    });
  });
});
