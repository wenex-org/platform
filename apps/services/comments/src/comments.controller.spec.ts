import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let commentsController: CommentsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService],
    }).compile();

    commentsController = app.get<CommentsController>(CommentsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(commentsController.getHello()).toBe('Hello World!');
    });
  });
});
