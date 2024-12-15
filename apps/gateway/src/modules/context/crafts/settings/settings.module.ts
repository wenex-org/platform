import { Module } from '@nestjs/common';

import { SettingsResolver } from './settings.resolver';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [SettingsResolver],
})
export class SettingsModule {}
