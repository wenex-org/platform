import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

describe('ServicesController', () => {
  let servicesController: ServicesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [ServicesService],
    }).compile();

    servicesController = app.get<ServicesController>(ServicesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(servicesController.getHello()).toBe('Hello World!');
    });
  });
});
