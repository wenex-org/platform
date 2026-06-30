import { Module } from '@nestjs/common';

import { SubmissionsResolver } from './submissions.resolver';
import { SubmissionsController } from './submissions.controller';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsResolver],
})
export class SubmissionsModule {}
