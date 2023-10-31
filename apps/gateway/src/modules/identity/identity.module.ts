import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { UsersModule } from './crafts/users';
import { clientsModuleOptions } from './identity.options';

@Module({
  imports: [ClientsModule.register(clientsModuleOptions), ...[UsersModule]],
})
export class IdentityModule {}
