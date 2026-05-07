import { registerDocumentations } from '@app/common/core/mcp/loader.mcp';
import { Module, OnModuleInit } from '@nestjs/common';

import './core.router';

@Module({})
export class CoreModule implements OnModuleInit {
  onModuleInit() {
    registerDocumentations();
  }
}
