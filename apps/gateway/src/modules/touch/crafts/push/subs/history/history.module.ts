import { Module } from '@nestjs/common';

import { PushHistoryResolver } from './history.resolver';
import { PushHistoryController } from './history.controller';

@Module({
  controllers: [PushHistoryController],
  providers: [PushHistoryResolver],
})
export class PushHistoryModule {}
