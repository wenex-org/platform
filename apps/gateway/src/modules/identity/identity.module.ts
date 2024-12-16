import { IdentityProvider, IdentityProviderModule } from '@app/common/providers/identity';
import { Global, Module } from '@nestjs/common';

import { UsersModule } from './crafts/users';
import { ProfilesModule } from './crafts/profiles';
import { SessionsModule } from './crafts/sessions';

@Global()
@Module({
  imports: [IdentityProviderModule.forRoot(), ...[UsersModule, ProfilesModule, SessionsModule]],
  providers: [IdentityProvider],
  exports: [IdentityProvider],
})
export class IdentityModule {}
