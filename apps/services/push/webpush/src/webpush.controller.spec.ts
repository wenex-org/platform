import { Test, TestingModule } from '@nestjs/testing';
import { WebpushController } from './webpush.controller';
import { WebpushService } from './webpush.service';

describe('WebpushController', () => {
  let webpushController: WebpushController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebpushController],
      providers: [WebpushService],
    }).compile();

    webpushController = app.get<WebpushController>(WebpushController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(webpushController.getHello()).toBe('Hello World!');
    });
  });
});
