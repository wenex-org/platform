import { Test, TestingModule } from '@nestjs/testing';
import { CoworkersController } from './coworkers.controller';
import { CoworkersService } from './coworkers.service';

describe('CoworkersController', () => {
  let coworkersController: CoworkersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoworkersController],
      providers: [CoworkersService],
    }).compile();

    coworkersController = app.get<CoworkersController>(CoworkersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(coworkersController.getHello()).toBe('Hello World!');
    });
  });
});
