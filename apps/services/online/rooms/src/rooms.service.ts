import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomsService {
  getHello(): string {
    return 'Hello World!';
  }
}
