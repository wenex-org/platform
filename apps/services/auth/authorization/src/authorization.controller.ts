import { Controller, Get } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';

@Controller()
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Get()
  getHello(): string {
    return this.authorizationService.getHello();
  }
}
