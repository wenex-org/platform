import { SpecialProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { StatsModule } from './crafts/stats';
import { FilesModule } from './crafts/files';
import { SagasModule } from './crafts/sagas';

@Module({
  imports: [SpecialProviderModule.forRoot(), ...[FilesModule, StatsModule, SagasModule]],
})
export class SpecialModule {}
