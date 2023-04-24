import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfilesService {
  getHello(): string {
    return 'Hello World!';
  }
}
