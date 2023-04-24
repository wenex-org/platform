import { NestFactory } from '@nestjs/core';
import { AppsModule } from './apps.module';

async function bootstrap() {
  const app = await NestFactory.create(AppsModule);
  await app.listen(3000);
}
bootstrap();
