import { Module } from '@nestjs/common';

import { LocationsResolver } from './locations.resolver';
import { LocationsInspector } from './locations.inspector';
import { LocationsController } from './locations.controller';

@Module({
  controllers: [LocationsController, LocationsInspector],
  providers: [LocationsResolver],
})
export class LocationsModule { }
