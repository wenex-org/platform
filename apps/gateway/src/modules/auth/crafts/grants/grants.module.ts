import { Module } from '@nestjs/common';

import { GrantsResolver } from './grants.resolver';
import { GrantsController } from './grants.controller';

@Module({
  controllers: [GrantsController],
  providers: [GrantsResolver],
})
export class GrantsModule {}
