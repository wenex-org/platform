import { IdentityProvider, identityClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';

@Module({
  imports: [ClientsModule.register(identityClientsModuleOptions)],
  controllers: [UsersController],
  providers: [IdentityProvider],
})
export class UsersModule {}
