import { NestFactory } from '@nestjs/core';
import { MetricsModule } from './metrics.module';

async function bootstrap() {
  const app = await NestFactory.create(MetricsModule);
  await app.listen(3000);
}
bootstrap();
