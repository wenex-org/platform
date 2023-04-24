import { Injectable } from '@nestjs/common';

@Injectable()
export class AppsService {
  getHello(): string {
    return 'Hello World!';
  }
}
