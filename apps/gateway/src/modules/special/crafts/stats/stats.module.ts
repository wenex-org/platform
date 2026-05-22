import { Module } from '@nestjs/common';

import { StatsResolver } from './stats.resolver';
import { StatsController } from './stats.controller';

@Module({
  controllers: [StatsController],
  providers: [StatsResolver],
})
export class StatsModule {}
