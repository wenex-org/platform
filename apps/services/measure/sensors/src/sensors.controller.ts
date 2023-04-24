import { Controller, Get } from '@nestjs/common';
import { SensorsService } from './sensors.service';

@Controller()
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get()
  getHello(): string {
    return this.sensorsService.getHello();
  }
}
