import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationController', () => {
  let authorizationController: AuthorizationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizationController],
      providers: [AuthorizationService],
    }).compile();

    authorizationController = app.get<AuthorizationController>(AuthorizationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authorizationController.getHello()).toBe('Hello World!');
    });
  });
});
