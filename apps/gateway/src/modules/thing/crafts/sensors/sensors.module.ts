import { Module } from '@nestjs/common';

import './sensors.router';
import { SensorsResolver } from './sensors.resolver';
import { SensorsController } from './sensors.controller';

@Module({
  controllers: [SensorsController],
  providers: [SensorsResolver],
})
export class SensorsModule {}
