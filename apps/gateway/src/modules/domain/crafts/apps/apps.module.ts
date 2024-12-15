import { Module } from '@nestjs/common';

import { AppsResolver } from './apps.resolver';
import { AppsController } from './apps.controller';

@Module({
  controllers: [AppsController],
  providers: [AppsResolver],
})
export class AppsModule {}
