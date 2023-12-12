import { specialClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { StatsModule } from './crafts/stats';

@Module({
  imports: [
    ClientsModule.register(specialClientsModuleOptions({ isGlobal: true })),
    ...[StatsModule],
  ],
})
export class SpecialModule {}
