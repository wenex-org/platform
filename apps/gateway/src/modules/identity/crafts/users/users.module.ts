import { IdentityProvider, identityClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { UsersResolver } from './users.resolver';
import { UsersController } from './users.controller';

@Module({
  imports: [ClientsModule.register(identityClientsModuleOptions)],
  controllers: [UsersController],
  providers: [UsersResolver, IdentityProvider],
})
export class UsersModule {}
