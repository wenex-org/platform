import { DomainProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { ClientsResolver } from './clients.resolver';
import { ClientsController } from './clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [DomainProvider, ClientsResolver],
})
export class ClientsModule {}
