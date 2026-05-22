import { Module } from '@nestjs/common';

import { InvoicesResolver } from './invoices.resolver';
import { InvoicesController } from './invoices.controller';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesResolver],
})
export class InvoicesModule {}
