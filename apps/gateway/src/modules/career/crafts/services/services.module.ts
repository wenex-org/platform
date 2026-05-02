import { Module } from '@nestjs/common';

import './services.router';
import { ServicesResolver } from './services.resolver';
import { ServicesController } from './services.controller';

@Module({
  controllers: [ServicesController],
  providers: [ServicesResolver],
})
export class ServicesModule {}
