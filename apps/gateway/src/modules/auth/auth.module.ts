import { AuthProvider, AuthProviderModule } from '@app/common/providers/auth';
import { Global, Module } from '@nestjs/common';

import { GrantsModule } from './crafts/grants';

@Global()
@Module({
  imports: [AuthProviderModule.forRoot(), ...[GrantsModule]],
  providers: [AuthProvider],
  exports: [AuthProvider],
})
export class AuthModule {}
