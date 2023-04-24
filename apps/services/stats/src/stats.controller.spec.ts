import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let statsController: StatsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [StatsService],
    }).compile();

    statsController = app.get<StatsController>(StatsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(statsController.getHello()).toBe('Hello World!');
    });
  });
});
