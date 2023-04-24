import { NestFactory } from '@nestjs/core';
import { LocationsModule } from './locations.module';

async function bootstrap() {
  const app = await NestFactory.create(LocationsModule);
  await app.listen(3000);
}
bootstrap();
