import { Module } from '@nestjs/common';

import { CustomersResolver } from './customers.resolver';
import { CustomersController } from './customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [CustomersResolver],
})
export class CustomersModule {}
