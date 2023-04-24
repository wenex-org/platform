import { NestFactory } from '@nestjs/core';
import { ArtifactsModule } from './artifacts.module';

async function bootstrap() {
  const app = await NestFactory.create(ArtifactsModule);
  await app.listen(3000);
}
bootstrap();
