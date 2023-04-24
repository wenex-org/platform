import { Injectable } from '@nestjs/common';

@Injectable()
export class WebpushService {
  getHello(): string {
    return 'Hello World!';
  }
}
