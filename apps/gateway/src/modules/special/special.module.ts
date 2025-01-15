import { SpecialProvider, SpecialProviderModule } from '@app/common/providers/special';
import { Global, Module } from '@nestjs/common';

import { FilesModule } from './crafts/files';
import { StatsModule } from './crafts/stats';

@Global()
@Module({
  imports: [SpecialProviderModule.forRoot(), ...[FilesModule, StatsModule]],
  providers: [SpecialProvider],
  exports: [SpecialProvider],
})
export class SpecialModule {}
