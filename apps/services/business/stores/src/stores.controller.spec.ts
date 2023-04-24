import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

describe('StoresController', () => {
  let storesController: StoresController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [StoresService],
    }).compile();

    storesController = app.get<StoresController>(StoresController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(storesController.getHello()).toBe('Hello World!');
    });
  });
});
