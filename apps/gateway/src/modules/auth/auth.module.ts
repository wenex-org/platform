import { AuthProvider, AuthProviderModule } from '@app/common/providers/auth';
import { Global, Module } from '@nestjs/common';

import { AuthsModule } from './crafts/auths';
import { GrantsModule } from './crafts/grants';

@Global()
@Module({
  imports: [AuthProviderModule.forRoot(), ...[AuthsModule, GrantsModule]],
  providers: [AuthProvider],
  exports: [AuthProvider],
})
export class AuthModule {}
