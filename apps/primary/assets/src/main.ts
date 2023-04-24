import { NestFactory } from '@nestjs/core';
import { AssetsModule } from './assets.module';

async function bootstrap() {
  const app = await NestFactory.create(AssetsModule);
  await app.listen(3000);
}
bootstrap();
