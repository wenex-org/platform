import { AuthProvider, AuthProviderModule } from '@app/common/providers';
import { Global, Module } from '@nestjs/common';

import { GrantsModule } from './crafts/grants';
import { AuthorizationModule } from './crafts/authorization';
import { AuthenticationModule } from './crafts/authentication';

@Global()
@Module({
  imports: [AuthProviderModule.forRoot(), ...[AuthenticationModule, AuthorizationModule, GrantsModule]],
  providers: [AuthProvider],
  exports: [AuthProvider],
})
export class AuthModule { }
