import { Module } from '@nestjs/common';

import { WorkflowsResolver } from './workflows.resolver';
import { WorkflowsController } from './workflows.controller';

@Module({
  controllers: [WorkflowsController],
  providers: [WorkflowsResolver],
})
export class WorkflowsModule {}
