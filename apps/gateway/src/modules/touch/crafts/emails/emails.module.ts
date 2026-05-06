import { Module } from '@nestjs/common';

import './emails.router';
import { EmailsResolver } from './emails.resolver';
import { EmailsController } from './emails.controller';

@Module({
  controllers: [EmailsController],
  providers: [EmailsResolver],
})
export class EmailsModule {}
