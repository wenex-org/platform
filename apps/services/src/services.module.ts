import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
