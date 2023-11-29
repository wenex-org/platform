import { IdentityProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { SessionsResolver } from './sessions.resolver';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [IdentityProvider, SessionsResolver],
})
export class SessionsModule {}
