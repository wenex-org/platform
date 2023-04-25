import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let employeesController: EmployeesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [EmployeesService],
    }).compile();

    employeesController = app.get<EmployeesController>(EmployeesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(employeesController.getHello()).toBe('Hello World!');
    });
  });
});
