import { Module } from '@nestjs/common';

// import './businesses.router';
import { BusinessesResolver } from './businesses.resolver';
import { BusinessesController } from './businesses.controller';

@Module({
  controllers: [BusinessesController],
  providers: [BusinessesResolver],
})
export class BusinessesModule {}
