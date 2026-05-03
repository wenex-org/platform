import { Module } from '@nestjs/common';

import './cargoes.router';
import { CargoesResolver } from './cargoes.resolver';
import { CargoesController } from './cargoes.controller';

@Module({
  controllers: [CargoesController],
  providers: [CargoesResolver],
})
export class CargoesModule {}
