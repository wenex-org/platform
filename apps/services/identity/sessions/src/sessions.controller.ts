import { Controller, Get } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  getHello(): string {
    return this.sessionsService.getHello();
  }
}
