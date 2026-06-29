import { Module } from '@nestjs/common';

import { ContentsController } from './contents.controller';
import { ContentsResolver } from './contents.resolver';

@Module({
  controllers: [ContentsController],
  providers: [ContentsResolver],
})
export class ContentsModule {}
