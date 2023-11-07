import { Module } from '@nestjs/common';

import { GrantsModule } from './crafts/grants';
import { AuthorizationModule } from './crafts/authorization';
import { AuthenticationModule } from './crafts/authentication';

@Module({
  imports: [AuthenticationModule, AuthorizationModule, GrantsModule],
})
export class AuthModule {}
