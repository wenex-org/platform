import { Module } from '@nestjs/common';

import { TravelsResolver } from './travels.resolver';
import { TravelsController } from './travels.controller';

@Module({
  controllers: [TravelsController],
  providers: [TravelsResolver],
})
export class TravelsModule {}
