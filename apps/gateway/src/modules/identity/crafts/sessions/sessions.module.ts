import { IdentityProvider, identityClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { SessionsResolver } from './sessions.resolver';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [ClientsModule.register(identityClientsModuleOptions)],
  controllers: [SessionsController],
  providers: [SessionsResolver, IdentityProvider],
})
export class SessionsModule {}
