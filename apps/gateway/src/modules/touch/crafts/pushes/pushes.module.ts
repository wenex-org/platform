import { Module } from '@nestjs/common';

import { PushesResolver } from './pushes.resolver';
import { PushesInspector } from './pushes.inspector';
import { PushesController } from './pushes.controller';
import { PushHistoriesModule } from './subs/histories';

@Module({
  imports: [PushHistoriesModule],
  controllers: [PushesController, PushesInspector],
  providers: [PushesResolver],
})
export class PushesModule { }
