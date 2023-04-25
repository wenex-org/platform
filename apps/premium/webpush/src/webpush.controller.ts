import { Controller, Get } from '@nestjs/common';
import { WebpushService } from './webpush.service';

@Controller()
export class WebpushController {
  constructor(private readonly webpushService: WebpushService) {}

  @Get()
  getHello(): string {
    return this.webpushService.getHello();
  }
}
