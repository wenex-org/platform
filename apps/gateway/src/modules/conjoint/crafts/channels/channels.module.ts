import { Module } from '@nestjs/common';

import './channels.router';
import { ChannelsResolver } from './channels.resolver';
import { ChannelsController } from './channels.controller';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsResolver],
})
export class ChannelsModule {}
