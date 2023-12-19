import { Module } from '@nestjs/common';

import { ProfilesResolver } from './profiles.resolver';
import { ProfilesController } from './profiles.controller';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesResolver],
})
export class ProfilesModule {}
