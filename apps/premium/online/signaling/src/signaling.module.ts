import { Module } from '@nestjs/common';
import { SignalingController } from './signaling.controller';
import { SignalingService } from './signaling.service';

@Module({
  imports: [],
  controllers: [SignalingController],
  providers: [SignalingService],
})
export class SignalingModule {}
