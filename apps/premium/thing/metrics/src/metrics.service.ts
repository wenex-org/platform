import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  getHello(): string {
    return 'Hello World!';
  }
}
