import { Controller, Get } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  getHello(): string {
    return this.locationsService.getHello();
  }
}
