import { Module } from '@nestjs/common';

import { TransactionsResolver } from './transactions.resolver';
import { TransactionsController } from './transactions.controller';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsResolver],
})
export class TransactionsModule {}
