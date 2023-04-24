import { Controller, Get } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller()
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get()
  getHello(): string {
    return this.otpService.getHello();
  }
}
