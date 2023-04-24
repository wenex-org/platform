import { NestFactory } from '@nestjs/core';
import { CoworkersModule } from './coworkers.module';

async function bootstrap() {
  const app = await NestFactory.create(CoworkersModule);
  await app.listen(3000);
}
bootstrap();
