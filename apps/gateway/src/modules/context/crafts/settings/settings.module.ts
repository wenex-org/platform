import { Module } from '@nestjs/common';

import './settings.router';
import { SettingsResolver } from './settings.resolver';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [SettingsResolver],
})
export class SettingsModule {}
