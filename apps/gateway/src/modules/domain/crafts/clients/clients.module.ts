import { DomainProvider, domainClientsModuleOptions } from '@app/common/providers';
import { ClientsModule as ClientModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { ClientsResolver } from './clients.resolver';
import { ClientsController } from './clients.controller';

@Module({
  imports: [ClientModule.register(domainClientsModuleOptions)],
  controllers: [ClientsController],
  providers: [ClientsResolver, DomainProvider],
})
export class ClientsModule {}
