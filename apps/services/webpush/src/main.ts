import { NestFactory } from '@nestjs/core';
import { WebpushModule } from './webpush.module';

async function bootstrap() {
  const app = await NestFactory.create(WebpushModule);
  await app.listen(3000);
}
bootstrap();
