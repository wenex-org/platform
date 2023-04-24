import { NestFactory } from '@nestjs/core';
import { SignalingModule } from './signaling.module';

async function bootstrap() {
  const app = await NestFactory.create(SignalingModule);
  await app.listen(3000);
}
bootstrap();
