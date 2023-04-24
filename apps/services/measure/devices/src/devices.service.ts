import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesService {
  getHello(): string {
    return 'Hello World!';
  }
}
