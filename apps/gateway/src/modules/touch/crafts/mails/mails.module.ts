import { Module } from '@nestjs/common';

import { MailsResolver } from './mails.resolver';
import { MailsController } from './mails.controller';

@Module({
  controllers: [MailsController],
  providers: [MailsResolver],
})
export class MailsModule {}
