import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
