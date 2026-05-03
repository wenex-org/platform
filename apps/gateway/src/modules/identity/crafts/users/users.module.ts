import { Module } from '@nestjs/common';

import './users.router';
import { UsersResolver } from './users.resolver';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersResolver],
})
export class UsersModule {}
