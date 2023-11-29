import { configClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { ConfigsModule } from './crafts/configs';
import { SettingsModule } from './crafts/settings';

@Module({
  imports: [
    ClientsModule.register(
      configClientsModuleOptions('modules/config/config.proto', { isGlobal: true }),
    ),
    ...[ConfigsModule, SettingsModule],
  ],
})
export class ConfigModule {}
