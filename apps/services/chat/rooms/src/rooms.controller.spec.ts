import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

describe('RoomsController', () => {
  let roomsController: RoomsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [RoomsService],
    }).compile();

    roomsController = app.get<RoomsController>(RoomsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(roomsController.getHello()).toBe('Hello World!');
    });
  });
});
