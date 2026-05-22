import { Module } from '@nestjs/common';

import { MessagesResolver } from './messages.resolver';
import { MessagesController } from './messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [MessagesResolver],
})
export class MessagesModule {}
