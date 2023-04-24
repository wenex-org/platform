import { Injectable } from '@nestjs/common';

@Injectable()
export class EmployeesService {
  getHello(): string {
    return 'Hello World!';
  }
}
