import { NestFactory } from '@nestjs/core';
import { WalletsModule } from './wallets.module';

async function bootstrap() {
  const app = await NestFactory.create(WalletsModule);
  await app.listen(3000);
}
bootstrap();
