import { Module } from '@nestjs/common';

import './messages.router';
import { MessagesResolver } from './messages.resolver';
import { MessagesController } from './messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [MessagesResolver],
})
export class MessagesModule {}
