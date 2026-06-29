import { Module } from '@nestjs/common';

import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsResolver } from './enrollments.resolver';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsResolver],
})
export class EnrollmentsModule {}
