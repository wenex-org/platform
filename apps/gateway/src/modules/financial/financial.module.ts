import { FinancialProvider, FinancialProviderModule } from '@app/common/providers/financial';
import { Global, Module } from '@nestjs/common';

import { WalletsModule } from './crafts/wallets';
import { AccountsModule } from './crafts/accounts';
import { InvoicesModule } from './crafts/invoices';
import { CurrenciesModule } from './crafts/currencies';
import { TransactionsModule } from './crafts/transactions';

@Global()
@Module({
  imports: [
    FinancialProviderModule.forRoot(),

    ...[WalletsModule, AccountsModule, InvoicesModule, CurrenciesModule, TransactionsModule],
  ],
  providers: [FinancialProvider],
  exports: [FinancialProvider],
})
export class FinancialModule {}
