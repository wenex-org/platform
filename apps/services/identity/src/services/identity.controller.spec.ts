import { Test, TestingModule } from '@nestjs/testing';
import { Services/identityController } from './services/identity.controller';
import { Services/identityService } from './services/identity.service';

describe('Services/identityController', () => {
  let services/identityController: Services/identityController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Services/identityController],
      providers: [Services/identityService],
    }).compile();

    services/identityController = app.get<Services/identityController>(Services/identityController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(services/identityController.getHello()).toBe('Hello World!');
    });
  });
});
