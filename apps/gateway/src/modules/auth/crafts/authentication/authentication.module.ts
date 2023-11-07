import { AuthProvider, authClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [ClientsModule.register(authClientsModuleOptions('modules/auth/auth.proto'))],
  controllers: [AuthenticationController],
  providers: [AuthenticationResolver, AuthProvider],
})
export class AuthenticationModule {}
