import { Module } from '@nestjs/common';

import { AptsResolver } from './apts.resolver';
import { AptsController } from './apts.controller';

@Module({
  controllers: [AptsController],
  providers: [AptsResolver],
})
export class AptsModule {}
