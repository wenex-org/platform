import { Module } from '@nestjs/common';

import { NoticesResolver } from './notices.resolver';
import { NoticesController } from './notices.controller';

@Module({
  controllers: [NoticesController],
  providers: [NoticesResolver],
})
export class NoticesModule {}
