import { ConfigProvider, configClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { ConfigsResolver } from './configs.resolver';
import { ConfigsController } from './configs.controller';

@Module({
  imports: [ClientsModule.register(configClientsModuleOptions)],
  controllers: [ConfigsController],
  providers: [ConfigsResolver, ConfigProvider],
})
export class ConfigsModule {}
