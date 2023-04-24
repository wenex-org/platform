import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

describe('SessionsController', () => {
  let sessionsController: SessionsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [SessionsService],
    }).compile();

    sessionsController = app.get<SessionsController>(SessionsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sessionsController.getHello()).toBe('Hello World!');
    });
  });
});
