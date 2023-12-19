import { ConfigProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { ConfigsModule } from './crafts/configs';
import { SettingsModule } from './crafts/settings';

@Module({
  imports: [
    ConfigProviderModule.forRoot('modules/config/config.proto'),
    ...[ConfigsModule, SettingsModule],
  ],
})
export class ConfigModule {}
