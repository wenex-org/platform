import { Module } from '@nestjs/common';

import { ConfigsResolver } from './configs.resolver';
import { ConfigsController } from './configs.controller';

@Module({
  controllers: [ConfigsController],
  providers: [ConfigsResolver],
})
export class ConfigsModule {}
