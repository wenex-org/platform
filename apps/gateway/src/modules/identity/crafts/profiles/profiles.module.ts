import { IdentityProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { ProfilesResolver } from './profiles.resolver';
import { ProfilesController } from './profiles.controller';

@Module({
  controllers: [ProfilesController],
  providers: [IdentityProvider, ProfilesResolver],
})
export class ProfilesModule {}
