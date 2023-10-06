import { Controller, Get } from '@nestjs/common';
import { Services/domainService } from './services/domain.service';

@Controller()
export class Services/domainController {
  constructor(private readonly services/domainService: Services/domainService) {}

  @Get()
  getHello(): string {
    return this.services/domainService.getHello();
  }
}
