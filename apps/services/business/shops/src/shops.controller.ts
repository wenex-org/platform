import { Controller, Get } from '@nestjs/common';
import { ShopsService } from './shops.service';

@Controller()
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  getHello(): string {
    return this.shopsService.getHello();
  }
}
