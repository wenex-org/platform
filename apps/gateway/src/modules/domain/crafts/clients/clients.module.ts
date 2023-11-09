import { Module } from '@nestjs/common';

import { ClientsResolver } from './clients.resolver';
import { ClientsController } from './clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [ClientsResolver],
})
export class ClientsModule {}
