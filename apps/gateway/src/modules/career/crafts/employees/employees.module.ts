import { Module } from '@nestjs/common';

import { EmployeesResolver } from './employees.resolver';
import { EmployeesController } from './employees.controller';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesResolver],
})
export class EmployeesModule {}
