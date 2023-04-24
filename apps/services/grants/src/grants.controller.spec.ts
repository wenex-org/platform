import { Test, TestingModule } from '@nestjs/testing';
import { GrantsController } from './grants.controller';
import { GrantsService } from './grants.service';

describe('GrantsController', () => {
  let grantsController: GrantsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GrantsController],
      providers: [GrantsService],
    }).compile();

    grantsController = app.get<GrantsController>(GrantsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(grantsController.getHello()).toBe('Hello World!');
    });
  });
});
