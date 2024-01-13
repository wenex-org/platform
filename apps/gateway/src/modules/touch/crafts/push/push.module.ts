import { Module } from '@nestjs/common';

import { PushResolver } from './push.resolver';
import { PushInspector } from './push.inspector';
import { PushController } from './push.controller';
import { PushHistoryModule } from './subs/history';

@Module({
  imports: [PushHistoryModule],
  controllers: [PushController, PushInspector],
  providers: [PushResolver],
})
export class PushModule {}
