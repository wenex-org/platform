import { EssentialProvider, EssentialProviderModule } from '@app/common/providers/essential';
import { Global, Module } from '@nestjs/common';

import { StatsModule } from './crafts/stats';

@Global()
@Module({
  imports: [EssentialProviderModule.forRoot(), ...[StatsModule]],
  providers: [EssentialProvider],
  exports: [EssentialProvider],
})
export class EssentialModule {}
