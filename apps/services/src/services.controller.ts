import { Controller, Get } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  getHello(): string {
    return this.servicesService.getHello();
  }
}
