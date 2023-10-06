import { Injectable } from '@nestjs/common';

@Injectable()
export class Services/domainService {
  getHello(): string {
    return 'Hello World!';
  }
}
