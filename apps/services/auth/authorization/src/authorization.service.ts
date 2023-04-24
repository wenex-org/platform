import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthorizationService {
  getHello(): string {
    return 'Hello World!';
  }
}
