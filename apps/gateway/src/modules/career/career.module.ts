import { CareerProvider, CareerProviderModule } from '@app/common/providers/career';
import { Global, Module } from '@nestjs/common';

import { StocksModule } from './crafts/stocks';
import { StoresModule } from './crafts/stores';
import { ProductsModule } from './crafts/products';
import { BranchesModule } from './crafts/branches';
import { ServicesModule } from './crafts/services';
import { EmployeesModule } from './crafts/employees';
import { CustomersModule } from './crafts/customers';
import { BusinessesModule } from './crafts/businesses';

@Global()
@Module({
  imports: [
    CareerProviderModule.forRoot(),
    ...[
      StocksModule,
      StoresModule,
      ProductsModule,
      BranchesModule,
      ServicesModule,
      EmployeesModule,
      CustomersModule,
      BusinessesModule,
    ],
  ],
  providers: [CareerProvider],
  exports: [CareerProvider],
})
export class CareerModule {}
