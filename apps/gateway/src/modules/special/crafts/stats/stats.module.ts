import { Module } from '@nestjs/common';

import { StatsResolver } from './stats.resolver';
import { StatsInspector } from './stats.inspector';
import { StatsController } from './stats.controller';

@Module({
  controllers: [StatsController, StatsInspector],
  providers: [StatsResolver],
})
export class StatsModule {}
