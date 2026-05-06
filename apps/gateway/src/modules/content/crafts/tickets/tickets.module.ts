import { Module } from '@nestjs/common';

import './tickets.router';
import { TicketsResolver } from './tickets.resolver';
import { TicketsController } from './tickets.controller';

@Module({
  controllers: [TicketsController],
  providers: [TicketsResolver],
})
export class TicketsModule {}
