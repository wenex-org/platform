import { Controller, Get } from '@nestjs/common';
import { CoworkersService } from './coworkers.service';

@Controller()
export class CoworkersController {
  constructor(private readonly coworkersService: CoworkersService) {}

  @Get()
  getHello(): string {
    return this.coworkersService.getHello();
  }
}
