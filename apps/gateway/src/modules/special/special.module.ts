import { specialClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { StatsModule } from './crafts/stats';
import { FilesModule } from './crafts/files';

@Module({
  imports: [
    ClientsModule.register(specialClientsModuleOptions({ isGlobal: true })),

    ...[FilesModule, StatsModule],
  ],
})
export class SpecialModule {}
