import { Module, OnModuleInit } from '@nestjs/common';

import { AptsResolver } from './apts.resolver';
import { mcpRegistration } from './apts.router';
import { AptsController } from './apts.controller';

@Module({
  controllers: [AptsController],
  providers: [AptsResolver],
})
export class AptsModule implements OnModuleInit {
  onModuleInit() {
    return mcpRegistration();
  }
}
