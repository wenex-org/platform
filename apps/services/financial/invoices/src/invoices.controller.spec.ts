import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

describe('InvoicesController', () => {
  let invoicesController: InvoicesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [InvoicesService],
    }).compile();

    invoicesController = app.get<InvoicesController>(InvoicesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(invoicesController.getHello()).toBe('Hello World!');
    });
  });
});
