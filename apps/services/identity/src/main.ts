import { NestFactory } from '@nestjs/core';
import { Services/identityModule } from './services/identity.module';

async function bootstrap() {
  const app = await NestFactory.create(Services/identityModule);
  await app.listen(3000);
}
bootstrap();
