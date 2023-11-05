import { Module } from '@nestjs/common';

import { ConfigsModule } from './crafts/configs';

@Module({
  imports: [ConfigsModule],
})
export class ConfigModule {}
