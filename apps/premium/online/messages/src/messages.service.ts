import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesService {
  getHello(): string {
    return 'Hello World!';
  }
}
