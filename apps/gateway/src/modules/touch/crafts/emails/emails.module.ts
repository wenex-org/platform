import { Module } from '@nestjs/common';

import { EmailsResolver } from './emails.resolver';
import { EmailsController } from './emails.controller';

@Module({
  controllers: [EmailsController],
  providers: [EmailsResolver],
})
export class EmailsModule {}
