import { AuthProvider, authClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';

import { GrantsModule } from './crafts/grants';
import { AuthorizationModule } from './crafts/authorization';
import { AuthenticationModule } from './crafts/authentication';

@Global()
@Module({
  imports: [
    ClientsModule.register(authClientsModuleOptions('modules/auth/auth.proto')),
    ...[AuthenticationModule, AuthorizationModule, GrantsModule],
  ],
  providers: [AuthProvider],
  exports: [AuthProvider],
})
export class AuthModule {}
