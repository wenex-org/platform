import { Injectable } from '@nestjs/common';

@Injectable()
export class SignalingService {
  getHello(): string {
    return 'Hello World!';
  }
}
