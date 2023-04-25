import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  getHello(): string {
    return 'Hello World!';
  }
}
