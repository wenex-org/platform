import { identityClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { UsersModule } from './crafts/users';
import { ProfilesModule } from './crafts/profiles';
import { SessionsModule } from './crafts/sessions';

@Module({
  imports: [
    ClientsModule.register(
      identityClientsModuleOptions('modules/identity/identity.proto', { isGlobal: true }),
    ),
    ...[UsersModule, ProfilesModule, SessionsModule],
  ],
})
export class IdentityModule {}
