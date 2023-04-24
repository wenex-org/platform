import { Controller, Get } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getHello(): string {
    return this.alertsService.getHello();
  }
}
