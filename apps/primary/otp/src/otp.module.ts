import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
  imports: [],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
