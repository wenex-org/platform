import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
