import { Test, TestingModule } from '@nestjs/testing';
import { SignalingController } from './signaling.controller';
import { SignalingService } from './signaling.service';

describe('SignalingController', () => {
  let signalingController: SignalingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SignalingController],
      providers: [SignalingService],
    }).compile();

    signalingController = app.get<SignalingController>(SignalingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(signalingController.getHello()).toBe('Hello World!');
    });
  });
});
