import { SpecialProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { StatsResolver } from './stats.resolver';
import { StatsController } from './stats.controller';

@Module({
  controllers: [StatsController],
  providers: [SpecialProvider, StatsResolver],
})
export class StatsModule {}
