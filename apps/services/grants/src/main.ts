import { NestFactory } from '@nestjs/core';
import { GrantsModule } from './grants.module';

async function bootstrap() {
  const app = await NestFactory.create(GrantsModule);
  await app.listen(3000);
}
bootstrap();
