import { Controller, Get } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  getHello(): string {
    return this.invoicesService.getHello();
  }
}
