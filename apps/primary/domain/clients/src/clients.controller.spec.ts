import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController', () => {
  let clientsController: ClientsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [ClientsService],
    }).compile();

    clientsController = app.get<ClientsController>(ClientsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(clientsController.getHello()).toBe('Hello World!');
    });
  });
});
