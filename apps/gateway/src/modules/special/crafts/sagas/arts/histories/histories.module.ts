import { Module } from '@nestjs/common';

import { SagaHistoriesResolver } from './histories.resolver';
import { SagaHistoriesController } from './histories.controller';

@Module({
  controllers: [SagaHistoriesController],
  providers: [SagaHistoriesResolver],
})
export class SagaHistoriesModule {}
