import { Module } from '@nestjs/common';

import { AuthsResolver } from './auths.resolver';
import { AuthsController } from './auths.controller';

@Module({
  controllers: [AuthsController],
  providers: [AuthsResolver],
})
export class AuthsModule {}
