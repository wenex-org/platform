import { ConfigProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { ConfigsResolver } from './configs.resolver';
import { ConfigsController } from './configs.controller';

@Module({
  controllers: [ConfigsController],
  providers: [ConfigProvider, ConfigsResolver],
})
export class ConfigsModule {}
