import { Injectable } from '@nestjs/common';

@Injectable()
export class AlertsService {
  getHello(): string {
    return 'Hello World!';
  }
}
