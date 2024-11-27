import { NestFactory } from '@nestjs/core';
import { WorkersModule } from './workers.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkersModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
