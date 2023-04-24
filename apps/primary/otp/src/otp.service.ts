import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  getHello(): string {
    return 'Hello World!';
  }
}
