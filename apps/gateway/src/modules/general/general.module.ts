import { GeneralProvider, GeneralProviderModule } from '@app/common/providers/general';
import { Global, Module } from '@nestjs/common';

import { NoticesModule } from './crafts/notices';
import { ArtifactsModule } from './crafts/artifacts';
import { WorkflowsModule } from './crafts/workflows';
import { ActivitiesModule } from './crafts/activities';

@Global()
@Module({
  imports: [GeneralProviderModule.forRoot(), ...[NoticesModule, ArtifactsModule, WorkflowsModule, ActivitiesModule]],
  providers: [GeneralProvider],
  exports: [GeneralProvider],
})
export class GeneralModule {}
