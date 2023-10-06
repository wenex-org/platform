import { Controller, Get } from '@nestjs/common';
import { Services/identityService } from './services/identity.service';

@Controller()
export class Services/identityController {
  constructor(private readonly services/identityService: Services/identityService) {}

  @Get()
  getHello(): string {
    return this.services/identityService.getHello();
  }
}
