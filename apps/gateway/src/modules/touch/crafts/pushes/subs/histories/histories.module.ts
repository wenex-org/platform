import { Module } from '@nestjs/common';

import { PushHistoriesResolver } from './histories.resolver';
import { PushHistoriesController } from './histories.controller';

@Module({
  controllers: [PushHistoriesController],
  providers: [PushHistoriesResolver],
})
export class PushHistoriesModule {}
