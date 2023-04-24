import { Controller, Get } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  getHello(): string {
    return this.profilesService.getHello();
  }
}
