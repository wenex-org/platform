import { IdentityProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { UsersModule } from './crafts/users';
import { ProfilesModule } from './crafts/profiles';
import { SessionsModule } from './crafts/sessions';

@Module({
  imports: [IdentityProviderModule.forRoot(), ...[UsersModule, ProfilesModule, SessionsModule]],
})
export class IdentityModule { }
