import { Module } from '@nestjs/common';

import { ChannelsResolver } from './channels.resolver';
import { ChannelsController } from './channels.controller';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsResolver],
})
export class ChannelsModule {}
