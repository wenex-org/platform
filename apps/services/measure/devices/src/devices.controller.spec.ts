import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

describe('DevicesController', () => {
  let devicesController: DevicesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [DevicesService],
    }).compile();

    devicesController = app.get<DevicesController>(DevicesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(devicesController.getHello()).toBe('Hello World!');
    });
  });
});
