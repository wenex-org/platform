import { FinancialProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { CoinsModule } from './crafts/coins';
import { WalletsModule } from './crafts/wallets';
import { AccountsModule } from './crafts/accounts';
import { TransactionsModule } from './crafts/transactions';

@Module({
  imports: [FinancialProviderModule.forRoot(), ...[AccountsModule, CoinsModule, WalletsModule, TransactionsModule]],
})
export class FinancialModule {}
