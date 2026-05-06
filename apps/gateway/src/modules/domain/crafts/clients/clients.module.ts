import { Module } from '@nestjs/common';

import './clients.router';
import { ClientsResolver } from './clients.resolver';
import { ClientsController } from './clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [ClientsResolver],
})
export class ClientsModule {}
