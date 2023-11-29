import { DomainProvider, domainClientsModuleOptions } from '@app/common/providers';
import { ClientsModule as GrpcClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { AppsModule } from './crafts/apps';
import { ClientsModule } from './crafts/clients';

@Module({
  imports: [
    GrpcClientsModule.register(
      domainClientsModuleOptions('modules/domain/domain.proto', { isGlobal: true }),
    ),
    ...[AppsModule, ClientsModule],
  ],
  providers: [DomainProvider],
  exports: [DomainProvider],
})
export class DomainModule {}
