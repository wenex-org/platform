import { LogisticProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { CargoesModule } from './crafts/cargoes';
import { DriversModule } from './crafts/drivers';
import { TravelsModule } from './crafts/travels';
import { VehiclesModule } from './crafts/vehicles';
import { LocationsModule } from './crafts/locations';

@Module({
  imports: [LogisticProviderModule.forRoot(), ...[CargoesModule, DriversModule, TravelsModule, VehiclesModule, LocationsModule]],
})
export class LogisticModule {}
