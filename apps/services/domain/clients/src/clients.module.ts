import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
