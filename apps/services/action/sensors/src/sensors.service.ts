import { Injectable } from '@nestjs/common';

@Injectable()
export class SensorsService {
  getHello(): string {
    return 'Hello World!';
  }
}
