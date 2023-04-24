import { Controller, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  getHello(): string {
    return this.roomsService.getHello();
  }
}
