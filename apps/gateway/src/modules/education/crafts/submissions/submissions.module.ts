import { Module } from '@nestjs/common';

import { SubmissionsController } from './submissions.controller';
import { SubmissionsResolver } from './submissions.resolver';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsResolver],
})
export class SubmissionsModule {}
