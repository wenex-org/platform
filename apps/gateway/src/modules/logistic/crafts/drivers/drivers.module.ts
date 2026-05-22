import { Module } from '@nestjs/common';

import { DriversResolver } from './drivers.resolver';
import { DriversController } from './drivers.controller';

@Module({
  controllers: [DriversController],
  providers: [DriversResolver],
})
export class DriversModule {}
