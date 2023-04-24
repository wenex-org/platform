import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
