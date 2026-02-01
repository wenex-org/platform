import { ThingProvider, ThingProviderModule } from '@app/common/providers/thing';
import { Global, Module } from '@nestjs/common';

import { DevicesModule } from './crafts/devices';
import { SensorsModule } from './crafts/sensors';
import { MetricsModule } from './crafts/metrics';

@Global()
@Module({
  imports: [ThingProviderModule.forRoot(), ...[DevicesModule, SensorsModule, MetricsModule]],
  providers: [ThingProvider],
  exports: [ThingProvider],
})
export class ThingModule {}
