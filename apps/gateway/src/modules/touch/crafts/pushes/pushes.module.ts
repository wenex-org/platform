import { Module } from '@nestjs/common';

import { PushesResolver } from './pushes.resolver';
import { PushesController } from './pushes.controller';

import { PusHistoriesModule } from './arts/histories';

@Module({
  imports: [PusHistoriesModule],
  controllers: [PushesController],
  providers: [PushesResolver],
})
export class PushesModule {}
