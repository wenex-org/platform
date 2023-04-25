import { NestFactory } from '@nestjs/core';
import { ShopsModule } from './shops.module';

async function bootstrap() {
  const app = await NestFactory.create(ShopsModule);
  await app.listen(3000);
}
bootstrap();
