import { Module } from '@nestjs/common';

import './activities.router';
import { ActivitiesResolver } from './activities.resolver';
import { ActivitiesController } from './activities.controller';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesResolver],
})
export class ActivitiesModule {}
