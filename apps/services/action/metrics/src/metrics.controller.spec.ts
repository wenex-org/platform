import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let metricsController: MetricsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [MetricsService],
    }).compile();

    metricsController = app.get<MetricsController>(MetricsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(metricsController.getHello()).toBe('Hello World!');
    });
  });
});
