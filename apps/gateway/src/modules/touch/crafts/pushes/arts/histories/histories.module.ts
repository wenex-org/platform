import { Module } from '@nestjs/common';

import { PusHistoriesResolver } from './histories.resolver';
import { PusHistoriesController } from './histories.controller';

@Module({
  controllers: [PusHistoriesController],
  providers: [PusHistoriesResolver],
})
export class PusHistoriesModule {}
