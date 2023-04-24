import { Test, TestingModule } from '@nestjs/testing';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

describe('AppsController', () => {
  let appsController: AppsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppsController],
      providers: [AppsService],
    }).compile();

    appsController = app.get<AppsController>(AppsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appsController.getHello()).toBe('Hello World!');
    });
  });
});
