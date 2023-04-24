import { NestFactory } from '@nestjs/core';
import { AuthorizationModule } from './authorization.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthorizationModule);
  await app.listen(3000);
}
bootstrap();
