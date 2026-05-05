import { Module } from '@nestjs/common';

import './devices.router';
import { DevicesResolver } from './devices.resolver';
import { DevicesController } from './devices.controller';

@Module({
  controllers: [DevicesController],
  providers: [DevicesResolver],
})
export class DevicesModule {}
