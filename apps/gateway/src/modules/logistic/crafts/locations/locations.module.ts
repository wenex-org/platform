import { Module } from '@nestjs/common';

import { LocationsResolver } from './locations.resolver';
import { LocationsController } from './locations.controller';

@Module({
  controllers: [LocationsController],
  providers: [LocationsResolver],
})
export class LocationsModule {}
