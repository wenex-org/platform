import { AuthProvider, authClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { GrantsResolver } from './grants.resolver';
import { GrantsController } from './grants.controller';

@Module({
  imports: [ClientsModule.register(authClientsModuleOptions)],
  controllers: [GrantsController],
  providers: [GrantsResolver, AuthProvider],
})
export class GrantsModule {}
