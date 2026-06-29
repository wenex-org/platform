import { Module } from '@nestjs/common';

import { SectionsController } from './sections.controller';
import { SectionsResolver } from './sections.resolver';

@Module({
  controllers: [SectionsController],
  providers: [SectionsResolver],
})
export class SectionsModule {}
