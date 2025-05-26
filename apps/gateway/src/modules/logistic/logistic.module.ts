import { LogisticProvider, LogisticProviderModule } from '@app/common/providers/logistic';
import { Global, Module } from '@nestjs/common';

import { CargoesModule } from './crafts/cargoes';
import { DriversModule } from './crafts/drivers';
import { TravelsModule } from './crafts/travels';
import { VehiclesModule } from './crafts/vehicles';
import { LocationsModule } from './crafts/locations';

@Global()
@Module({
  imports: [LogisticProviderModule.forRoot(), ...[CargoesModule, DriversModule, TravelsModule, VehiclesModule, LocationsModule]],
  providers: [LogisticProvider],
  exports: [LogisticProvider],
})
export class LogisticModule {}
