import { NestFactory } from '@nestjs/core';
import { AlertsModule } from './alerts.module';

async function bootstrap() {
  const app = await NestFactory.create(AlertsModule);
  await app.listen(3000);
}
bootstrap();
