import { Controller, Get } from '@nestjs/common';
import { AppsService } from './apps.service';

@Controller()
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  getHello(): string {
    return this.appsService.getHello();
  }
}
