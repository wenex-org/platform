import { NestFactory } from '@nestjs/core';
import { EmployeesModule } from './employees.module';

async function bootstrap() {
  const app = await NestFactory.create(EmployeesModule);
  await app.listen(3000);
}
bootstrap();
