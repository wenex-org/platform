import { Module } from '@nestjs/common';

import './currencies.router';
import { CurrenciesResolver } from './currencies.resolver';
import { CurrenciesController } from './currencies.controller';

@Module({
  controllers: [CurrenciesController],
  providers: [CurrenciesResolver],
})
export class CurrenciesModule {}
