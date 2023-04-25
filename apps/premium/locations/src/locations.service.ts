import { Injectable } from '@nestjs/common';

@Injectable()
export class LocationsService {
  getHello(): string {
    return 'Hello World!';
  }
}
