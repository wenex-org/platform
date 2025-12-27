import { AuthProvider, AuthProviderModule } from '@app/common/providers/auth';
import { Global, Module } from '@nestjs/common';

import { AptsModule } from './crafts/apts';
import { AuthsModule } from './crafts/auths';
import { GrantsModule } from './crafts/grants';

@Global()
@Module({
  imports: [AuthProviderModule.forRoot(), ...[AptsModule, AuthsModule, GrantsModule]],
  providers: [AuthProvider],
  exports: [AuthProvider],
})
export class AuthModule {}
