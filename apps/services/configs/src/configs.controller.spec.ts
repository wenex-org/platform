import { Test, TestingModule } from '@nestjs/testing';
import { ConfigsController } from './configs.controller';
import { ConfigsService } from './configs.service';

describe('ConfigsController', () => {
  let configsController: ConfigsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ConfigsController],
      providers: [ConfigsService],
    }).compile();

    configsController = app.get<ConfigsController>(ConfigsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(configsController.getHello()).toBe('Hello World!');
    });
  });
});
