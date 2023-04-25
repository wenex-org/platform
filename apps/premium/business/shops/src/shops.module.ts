import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
  imports: [],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
