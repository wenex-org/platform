import { Module } from '@nestjs/common';

import { SagaStagesResolver } from './stages.resolver';
import { SagaStagesController } from './stages.controller';

@Module({
  controllers: [SagaStagesController],
  providers: [SagaStagesResolver],
})
export class SagaStagesModule {}
