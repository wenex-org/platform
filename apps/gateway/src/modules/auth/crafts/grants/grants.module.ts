import { AuthProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { GrantsResolver } from './grants.resolver';
import { GrantsController } from './grants.controller';

@Module({
  controllers: [GrantsController],
  providers: [AuthProvider, GrantsResolver],
})
export class GrantsModule {}
