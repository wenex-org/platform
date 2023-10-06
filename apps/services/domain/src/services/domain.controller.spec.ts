import { Test, TestingModule } from '@nestjs/testing';
import { Services/domainController } from './services/domain.controller';
import { Services/domainService } from './services/domain.service';

describe('Services/domainController', () => {
  let services/domainController: Services/domainController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Services/domainController],
      providers: [Services/domainService],
    }).compile();

    services/domainController = app.get<Services/domainController>(Services/domainController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(services/domainController.getHello()).toBe('Hello World!');
    });
  });
});
