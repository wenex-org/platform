import { Test, TestingModule } from '@nestjs/testing';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

describe('ShopsController', () => {
  let shopsController: ShopsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ShopsController],
      providers: [ShopsService],
    }).compile();

    shopsController = app.get<ShopsController>(ShopsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(shopsController.getHello()).toBe('Hello World!');
    });
  });
});
