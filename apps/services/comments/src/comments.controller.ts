import { Controller, Get } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  getHello(): string {
    return this.commentsService.getHello();
  }
}
