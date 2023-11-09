import { DomainProvider, domainClientsModuleOptions } from '@app/common/providers';
import { ClientsModule as GrpcClientsModule } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';

import { AppsModule } from './crafts/apps';
import { ClientsModule } from './crafts/clients';

@Global()
@Module({
  imports: [
    GrpcClientsModule.register(domainClientsModuleOptions('modules/domain/domain.proto')),
    AppsModule,
    ClientsModule,
  ],
  providers: [DomainProvider],
  exports: [DomainProvider],
})
export class DomainModule {}
