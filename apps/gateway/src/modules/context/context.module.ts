import { ContextProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { ConfigsModule } from './crafts/configs';
import { SettingsModule } from './crafts/settings';

@Module({
  imports: [ContextProviderModule.forRoot(), ...[ConfigsModule, SettingsModule]],
})
export class ContextModule {}
