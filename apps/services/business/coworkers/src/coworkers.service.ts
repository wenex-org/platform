import { Injectable } from '@nestjs/common';

@Injectable()
export class CoworkersService {
  getHello(): string {
    return 'Hello World!';
  }
}
