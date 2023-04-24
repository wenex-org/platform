import { Controller, Get } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  getHello(): string {
    return this.devicesService.getHello();
  }
}
