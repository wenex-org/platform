import { NestFactory } from '@nestjs/core';
import { SensorsModule } from './sensors.module';

async function bootstrap() {
  const app = await NestFactory.create(SensorsModule);
  await app.listen(3000);
}
bootstrap();
