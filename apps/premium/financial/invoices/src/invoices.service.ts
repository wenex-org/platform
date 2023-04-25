import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicesService {
  getHello(): string {
    return 'Hello World!';
  }
}
