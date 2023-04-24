import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopsService {
  getHello(): string {
    return 'Hello World!';
  }
}
