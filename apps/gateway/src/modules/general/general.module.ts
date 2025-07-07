import { GeneralProvider, GeneralProviderModule } from '@app/common/providers/general';
import { Global, Module } from '@nestjs/common';

import { ArtifactsModule } from './crafts/artifacts';
import { WorkflowsModule } from './crafts/workflows';
import { ActivitiesModule } from './crafts/activities';

@Global()
@Module({
  imports: [GeneralProviderModule.forRoot(), ...[ArtifactsModule, WorkflowsModule, ActivitiesModule]],
  providers: [GeneralProvider],
  exports: [GeneralProvider],
})
export class GeneralModule {}
