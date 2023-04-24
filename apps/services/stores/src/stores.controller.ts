import { Controller, Get } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  getHello(): string {
    return this.storesService.getHello();
  }
}
