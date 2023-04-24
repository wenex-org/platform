import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

@Module({
  imports: [],
  controllers: [AppsController],
  providers: [AppsService],
})
export class AppsModule {}
