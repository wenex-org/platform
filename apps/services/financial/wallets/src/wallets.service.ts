import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletsService {
  getHello(): string {
    return 'Hello World!';
  }
}
