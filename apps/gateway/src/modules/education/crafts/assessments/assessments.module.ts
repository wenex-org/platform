import { Module } from '@nestjs/common';

import { AssessmentsController } from './assessments.controller';
import { AssessmentsResolver } from './assessments.resolver';

@Module({
  controllers: [AssessmentsController],
  providers: [AssessmentsResolver],
})
export class AssessmentsModule {}
