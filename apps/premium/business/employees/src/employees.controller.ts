import { Controller, Get } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  getHello(): string {
    return this.employeesService.getHello();
  }
}
