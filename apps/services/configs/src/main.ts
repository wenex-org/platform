import { NestFactory } from '@nestjs/core';
import { ConfigsModule } from './configs.module';

async function bootstrap() {
  const app = await NestFactory.create(ConfigsModule);
  await app.listen(3000);
}
bootstrap();
