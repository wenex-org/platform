import { IdentityProvider, identityClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

@Module({
  imports: [ClientsModule.register(identityClientsModuleOptions)],
  providers: [IdentityProvider],
})
export class UsersModule {}
