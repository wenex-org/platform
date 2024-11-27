import { Injectable } from '@nestjs/common';

@Injectable()
export class ServicesService {
  getHello(): string {
    return 'Hello World!';
  }
}
