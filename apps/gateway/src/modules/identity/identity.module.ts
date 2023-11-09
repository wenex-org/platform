import { IdentityProvider, identityClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';

import { UsersModule } from './crafts/users';
import { ProfilesModule } from './crafts/profiles';
import { SessionsModule } from './crafts/sessions';

@Global()
@Module({
  imports: [
    ClientsModule.register(
      identityClientsModuleOptions('modules/identity/identity.proto'),
    ),
    UsersModule,
    ProfilesModule,
    SessionsModule,
  ],
  providers: [IdentityProvider],
  exports: [IdentityProvider],
})
export class IdentityModule {}
