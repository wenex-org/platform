import { Module } from '@nestjs/common';

import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationController } from './authentication.controller';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationResolver],
})
export class AuthenticationModule {}
