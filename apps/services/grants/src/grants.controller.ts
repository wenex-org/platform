import { Controller, Get } from '@nestjs/common';
import { GrantsService } from './grants.service';

@Controller()
export class GrantsController {
  constructor(private readonly grantsService: GrantsService) {}

  @Get()
  getHello(): string {
    return this.grantsService.getHello();
  }
}
