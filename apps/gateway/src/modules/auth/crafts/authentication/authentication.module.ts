import { AuthProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationController } from './authentication.controller';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthProvider, AuthenticationResolver],
})
export class AuthenticationModule {}
