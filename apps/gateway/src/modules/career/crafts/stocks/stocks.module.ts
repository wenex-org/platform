import { Module } from '@nestjs/common';

import './stocks.router';
import { StocksResolver } from './stocks.resolver';
import { StocksController } from './stocks.controller';

@Module({
  controllers: [StocksController],
  providers: [StocksResolver],
})
export class StocksModule {}
