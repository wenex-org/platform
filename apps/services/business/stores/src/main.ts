import { NestFactory } from '@nestjs/core';
import { StoresModule } from './stores.module';

async function bootstrap() {
  const app = await NestFactory.create(StoresModule);
  await app.listen(3000);
}
bootstrap();
