import { Module, OnModuleInit } from '@nestjs/common';

import { GrantsResolver } from './grants.resolver';
import { mcpRegistration } from './grants.inspector';
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
