import { Controller, Get } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  getHello(): string {
    return this.clientsService.getHello();
  }
}
