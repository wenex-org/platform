import { ConfigProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { ConfigsModule } from './crafts/configs';
import { SettingsModule } from './crafts/settings';

@Module({
  imports: [ConfigProviderModule.forRoot(), ...[ConfigsModule, SettingsModule]],
})
export class ConfigModule { }
