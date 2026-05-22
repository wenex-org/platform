import { Module } from '@nestjs/common';

import { AccountsResolver } from './accounts.resolver';
import { AccountsController } from './accounts.controller';

@Module({
  controllers: [AccountsController],
  providers: [AccountsResolver],
})
export class AccountsModule {}
