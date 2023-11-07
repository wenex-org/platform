import { Module } from '@nestjs/common';

import { GrantsModule } from './crafts/grants';
import { AuthenticationModule } from './crafts/authentication';

@Module({
  imports: [GrantsModule, AuthenticationModule],
})
export class AuthModule {}
