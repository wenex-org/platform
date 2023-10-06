import { Injectable } from '@nestjs/common';

@Injectable()
export class Services/identityService {
  getHello(): string {
    return 'Hello World!';
  }
}
