import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

describe('WalletsController', () => {
  let walletsController: WalletsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [WalletsService],
    }).compile();

    walletsController = app.get<WalletsController>(WalletsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(walletsController.getHello()).toBe('Hello World!');
    });
  });
});
