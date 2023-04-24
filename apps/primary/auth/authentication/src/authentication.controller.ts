import { Controller, Get } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get()
  getHello(): string {
    return this.authenticationService.getHello();
  }
}
