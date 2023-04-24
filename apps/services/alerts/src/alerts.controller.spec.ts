import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

describe('AlertsController', () => {
  let alertsController: AlertsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [AlertsService],
    }).compile();

    alertsController = app.get<AlertsController>(AlertsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(alertsController.getHello()).toBe('Hello World!');
    });
  });
});
