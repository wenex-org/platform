import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
