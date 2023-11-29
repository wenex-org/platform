import { ConfigProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { SettingsResolver } from './settings.resolver';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [ConfigProvider, SettingsResolver],
})
export class SettingsModule {}
