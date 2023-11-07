import { DomainProvider, domainClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { AppsResolver } from './apps.resolver';
import { AppsController } from './apps.controller';

@Module({
  imports: [
    ClientsModule.register(domainClientsModuleOptions('modules/domain/domain.proto')),
  ],
  controllers: [AppsController],
  providers: [AppsResolver, DomainProvider],
})
export class AppsModule {}
