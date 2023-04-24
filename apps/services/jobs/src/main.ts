import { NestFactory } from '@nestjs/core';
import { JobsModule } from './jobs.module';

async function bootstrap() {
  const app = await NestFactory.create(JobsModule);
  await app.listen(3000);
}
bootstrap();
