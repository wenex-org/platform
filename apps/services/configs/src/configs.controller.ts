import { Controller, Get } from '@nestjs/common';
import { ConfigsService } from './configs.service';

@Controller()
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get()
  getHello(): string {
    return this.configsService.getHello();
  }
}
