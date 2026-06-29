import { Module } from '@nestjs/common';

import { GradesController } from './grades.controller';
import { GradesResolver } from './grades.resolver';

@Module({
  controllers: [GradesController],
  providers: [GradesResolver],
})
export class GradesModule {}
