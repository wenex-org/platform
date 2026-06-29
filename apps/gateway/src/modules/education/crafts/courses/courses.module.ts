import { Module } from '@nestjs/common';

import { CoursesController } from './courses.controller';
import { CoursesResolver } from './courses.resolver';

@Module({
  controllers: [CoursesController],
  providers: [CoursesResolver],
})
export class CoursesModule {}
