import { Module, OnModuleInit } from '@nestjs/common';

import { mcpRegistration } from './grants.router';
import { GrantsResolver } from './grants.resolver';
import { GrantsController } from './grants.controller';

@Module({
  controllers: [GrantsController],
  providers: [GrantsResolver],
})
export class GrantsModule implements OnModuleInit {
  onModuleInit() {
    return mcpRegistration();
  }
}
