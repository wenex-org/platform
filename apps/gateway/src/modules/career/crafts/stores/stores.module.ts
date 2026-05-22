import { Module } from '@nestjs/common';

import { StoresResolver } from './stores.resolver';
import { StoresController } from './stores.controller';

@Module({
  controllers: [StoresController],
  providers: [StoresResolver],
})
export class StoresModule {}
