import { NestFactory } from '@nestjs/core';
import { WorkflowsModule } from './workflows.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkflowsModule);
  await app.listen(3000);
}
bootstrap();
