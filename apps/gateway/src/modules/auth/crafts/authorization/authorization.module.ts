import { Module } from '@nestjs/common';

import { AuthorizationResolver } from './authorization.resolver';
import { AuthorizationController } from './authorization.controller';

@Module({
  controllers: [AuthorizationController],
  providers: [AuthorizationResolver],
})
export class AuthorizationModule {}
