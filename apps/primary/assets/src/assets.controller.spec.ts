import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

describe('AssetsController', () => {
  let assetsController: AssetsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [AssetsService],
    }).compile();

    assetsController = app.get<AssetsController>(AssetsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(assetsController.getHello()).toBe('Hello World!');
    });
  });
});
