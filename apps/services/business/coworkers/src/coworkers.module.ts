import { Module } from '@nestjs/common';
import { CoworkersController } from './coworkers.controller';
import { CoworkersService } from './coworkers.service';

@Module({
  imports: [],
  controllers: [CoworkersController],
  providers: [CoworkersService],
})
export class CoworkersModule {}
