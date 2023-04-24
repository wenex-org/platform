import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthenticationModule);
  await app.listen(3000);
}
bootstrap();
