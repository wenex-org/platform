import { Module } from '@nestjs/common';

import { MailsResolver } from './mails.resolver';
import { MailsInspector } from './mails.inspector';
import { MailsController } from './mails.controller';

@Module({
  controllers: [MailsController, MailsInspector],
  providers: [MailsResolver],
})
export class MailsModule {}
