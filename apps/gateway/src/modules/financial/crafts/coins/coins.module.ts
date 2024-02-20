import { Module } from '@nestjs/common';

import { CoinsResolver } from './coins.resolver';
import { CoinsController } from './coins.controller';

@Module({
  controllers: [CoinsController],
  providers: [CoinsResolver],
})
export class CoinsModule {}
