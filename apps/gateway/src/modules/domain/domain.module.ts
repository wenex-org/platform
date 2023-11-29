import { ClientsModule as GrpcClientsModule } from '@nestjs/microservices';
import { domainClientsModuleOptions } from '@app/common/providers';
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
})
export class DomainModule {}
