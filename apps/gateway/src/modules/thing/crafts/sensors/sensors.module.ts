import { Module } from '@nestjs/common';

import { SensorsResolver } from './sensors.resolver';
import { SensorsController } from './sensors.controller';

@Module({
  controllers: [SensorsController],
  providers: [SensorsResolver],
})
export class SensorsModule {}
