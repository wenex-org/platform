import { EducationProvider, EducationProviderModule } from '@app/common/providers/education';
import { Global, Module } from '@nestjs/common';

import { EnrollmentsModule } from './crafts/enrollments';
import { AssessmentsModule } from './crafts/assessments';
import { SubmissionsModule } from './crafts/submissions';
import { SectionsModule } from './crafts/sections';
import { ContentsModule } from './crafts/contents';
import { CoursesModule } from './crafts/courses';
import { GradesModule } from './crafts/grades';

@Global()
@Module({
  imports: [
    EducationProviderModule.forRoot(),
    ...[CoursesModule, SectionsModule, ContentsModule, EnrollmentsModule, AssessmentsModule, SubmissionsModule, GradesModule],
  ],
  providers: [EducationProvider],
  exports: [EducationProvider],
})
export class EducationModule {}
