import { IdentityProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { UsersResolver } from './users.resolver';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [IdentityProvider, UsersResolver],
})
export class UsersModule {}
