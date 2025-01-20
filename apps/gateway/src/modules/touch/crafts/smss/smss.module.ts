import { Module } from '@nestjs/common';

import { SmssResolver } from './smss.resolver';
import { SmssController } from './smss.controller';

@Module({
  controllers: [SmssController],
  providers: [SmssResolver],
})
export class SmssModule {}
