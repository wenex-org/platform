import { GeneralProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { ArtifactsModule } from './crafts/artifacts';
import { WorkflowsModule } from './crafts/workflows';

@Module({
  imports: [GeneralProviderModule.forRoot(), ...[ArtifactsModule, WorkflowsModule]],
})
export class GeneralModule {}
