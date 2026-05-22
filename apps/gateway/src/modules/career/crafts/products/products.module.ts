import { Module } from '@nestjs/common';

import { ProductsResolver } from './products.resolver';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController],
  providers: [ProductsResolver],
})
export class ProductsModule {}
