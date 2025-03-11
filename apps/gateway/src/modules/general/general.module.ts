import { GeneralProvider, GeneralProviderModule } from '@app/common/providers/general';
import { Global, Module } from '@nestjs/common';

import { WorkflowsModule } from './crafts/workflows';

@Global()
@Module({
  imports: [GeneralProviderModule.forRoot(), ...[WorkflowsModule]],
  providers: [GeneralProvider],
  exports: [GeneralProvider],
})
export class GeneralModule {}
