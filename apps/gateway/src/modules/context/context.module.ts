import { ContextProvider, ContextProviderModule } from '@app/common/providers/context';
import { Global, Module } from '@nestjs/common';

import { ConfigsModule } from './crafts/configs';
import { SettingsModule } from './crafts/settings';

@Global()
@Module({
  imports: [ContextProviderModule.forRoot(), ...[ConfigsModule, SettingsModule]],
  providers: [ContextProvider],
  exports: [ContextProvider],
})
export class ContextModule {}
