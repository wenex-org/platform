import { ConfigProvider, configClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';

import { ConfigsModule } from './crafts/configs';

@Global()
@Module({
  imports: [
    ClientsModule.register(configClientsModuleOptions('modules/config/config.proto')),
    ConfigsModule,
  ],
  providers: [ConfigProvider],
  exports: [ConfigProvider],
})
export class ConfigModule {}
