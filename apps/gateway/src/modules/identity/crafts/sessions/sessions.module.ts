import { Module } from '@nestjs/common';

import './sessions.router';
import { SessionsResolver } from './sessions.resolver';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [SessionsResolver],
})
export class SessionsModule {}
