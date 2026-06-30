import { EducationProvider, EducationProviderModule } from '@app/common/providers/education';
import { Global, Module } from '@nestjs/common';

import { SubmissionsModule } from './crafts/submissions';
import { EnrollmentsModule } from './crafts/enrollments';
import { CoursesModule } from './crafts/courses';

@Global()
@Module({
  imports: [EducationProviderModule.forRoot(), ...[CoursesModule, EnrollmentsModule, SubmissionsModule]],
  providers: [EducationProvider],
  exports: [EducationProvider],
})
export class EducationModule {}
