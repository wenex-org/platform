import { AuthProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { AuthorizationResolver } from './authorization.resolver';
import { AuthorizationController } from './authorization.controller';

@Module({
  controllers: [AuthorizationController],
  providers: [AuthProvider, AuthorizationResolver],
})
export class AuthorizationModule {}
