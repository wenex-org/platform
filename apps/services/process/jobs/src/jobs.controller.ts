import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  getHello(): string {
    return this.jobsService.getHello();
  }
}
