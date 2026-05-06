import { Module } from '@nestjs/common';

import './metrics.router';
import { MetricsResolver } from './metrics.resolver';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [MetricsResolver],
})
export class MetricsModule {}
