import { Module } from '@nestjs/common';

import { EventsResolver } from './events.resolver';
import { EventsController } from './events.controller';

@Module({
  controllers: [EventsController],
  providers: [EventsResolver],
})
export class EventsModule {}
