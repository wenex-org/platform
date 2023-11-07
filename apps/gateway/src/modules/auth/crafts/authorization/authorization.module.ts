import { AuthProvider, authClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { AuthorizationResolver } from './authorization.resolver';
import { AuthorizationController } from './authorization.controller';

@Module({
  imports: [ClientsModule.register(authClientsModuleOptions('modules/auth/auth.proto'))],
  controllers: [AuthorizationController],
  providers: [AuthorizationResolver, AuthProvider],
})
export class AuthorizationModule {}
