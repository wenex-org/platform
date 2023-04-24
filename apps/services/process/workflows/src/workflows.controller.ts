import { Controller, Get } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  getHello(): string {
    return this.workflowsService.getHello();
  }
}
