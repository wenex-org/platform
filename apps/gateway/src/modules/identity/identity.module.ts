import { Module } from '@nestjs/common';

import { UsersModule } from './crafts/users';
import { ProfilesModule } from './crafts/profiles';
import { SessionsModule } from './crafts/sessions';

@Module({
  imports: [UsersModule, ProfilesModule, SessionsModule],
})
export class IdentityModule {}
