import { EssentialProvider, EssentialProviderModule } from '@app/common/providers/essential';
import { Global, Module } from '@nestjs/common';

import { SagasModule } from './crafts/sagas';

@Global()
@Module({
  imports: [EssentialProviderModule.forRoot(), ...[SagasModule]],
  providers: [EssentialProvider],
  exports: [EssentialProvider],
})
export class EssentialModule {}
