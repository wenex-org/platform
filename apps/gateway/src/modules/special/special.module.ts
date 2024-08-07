import { SpecialProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { StatsModule } from './crafts/stats';
import { FilesModule } from './crafts/files';

@Module({
  imports: [SpecialProviderModule.forRoot(), ...[FilesModule, StatsModule]],
})
export class SpecialModule {}
