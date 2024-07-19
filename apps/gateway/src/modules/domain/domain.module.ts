import { DomainProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { AppsModule } from './crafts/apps';
import { ClientsModule } from './crafts/clients';

@Module({
  imports: [DomainProviderModule.forRoot('modules/domain/domain.proto'), ...[AppsModule, ClientsModule]],
})
export class DomainModule {}
