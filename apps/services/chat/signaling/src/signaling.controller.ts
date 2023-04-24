import { Controller, Get } from '@nestjs/common';
import { SignalingService } from './signaling.service';

@Controller()
export class SignalingController {
  constructor(private readonly signalingService: SignalingService) {}

  @Get()
  getHello(): string {
    return this.signalingService.getHello();
  }
}
