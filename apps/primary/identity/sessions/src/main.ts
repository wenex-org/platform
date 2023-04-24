import { NestFactory } from '@nestjs/core';
import { SessionsModule } from './sessions.module';

async function bootstrap() {
  const app = await NestFactory.create(SessionsModule);
  await app.listen(3000);
}
bootstrap();
