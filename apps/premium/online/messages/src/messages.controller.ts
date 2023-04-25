import { Controller, Get } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getHello(): string {
    return this.messagesService.getHello();
  }
}
