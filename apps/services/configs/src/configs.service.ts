import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigsService {
  getHello(): string {
    return 'Hello World!';
  }
}
