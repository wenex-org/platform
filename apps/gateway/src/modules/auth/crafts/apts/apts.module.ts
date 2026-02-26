import { Module, OnModuleInit } from '@nestjs/common';

import { AptsResolver } from './apts.resolver';
import { AptsController } from './apts.controller';
import { mcpRegistration } from '../apts/apts.inspector';

@Module({
  controllers: [AptsController],
  providers: [AptsResolver],
})
export class AptsModule implements OnModuleInit {
  async onModuleInit() {
    await mcpRegistration();
  }
}
