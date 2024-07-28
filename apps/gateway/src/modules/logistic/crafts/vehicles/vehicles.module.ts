import { Module } from '@nestjs/common';

import { VehiclesResolver } from './vehicles.resolver';
import { VehiclesController } from './vehicles.controller';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesResolver],
})
export class VehiclesModule {}
