import { CareerProvider, CareerProviderModule } from '@app/common/providers/career';
import { Global, Module } from '@nestjs/common';

import { BranchesModule } from './crafts/branches';
import { ServicesModule } from './crafts/services';
import { EmployeesModule } from './crafts/employees';
import { BusinessesModule } from './crafts/businesses';

@Global()
@Module({
  imports: [CareerProviderModule.forRoot(), ...[BranchesModule, ServicesModule, EmployeesModule, BusinessesModule]],
  providers: [CareerProvider],
  exports: [CareerProvider],
})
export class CareerModule {}
