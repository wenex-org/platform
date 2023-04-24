import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

describe('OtpController', () => {
  let otpController: OtpController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [OtpService],
    }).compile();

    otpController = app.get<OtpController>(OtpController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(otpController.getHello()).toBe('Hello World!');
    });
  });
});
