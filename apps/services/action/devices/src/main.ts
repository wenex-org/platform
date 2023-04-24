import { NestFactory } from '@nestjs/core';
import { DevicesModule } from './devices.module';

async function bootstrap() {
  const app = await NestFactory.create(DevicesModule);
  await app.listen(3000);
}
bootstrap();
