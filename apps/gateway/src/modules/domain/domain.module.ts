import { DomainProvider, DomainProviderModule } from '@app/common/providers/domain';
import { Global, Module } from '@nestjs/common';

import { AppsModule } from './crafts/apps';
import { ClientsModule } from './crafts/clients';

@Global()
@Module({
  imports: [DomainProviderModule.forRoot(), ...[AppsModule, ClientsModule]],
  providers: [DomainProvider],
  exports: [DomainProvider],
})
export class DomainModule {}
