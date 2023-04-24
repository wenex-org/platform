import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkflowsService {
  getHello(): string {
    return 'Hello World!';
  }
}
