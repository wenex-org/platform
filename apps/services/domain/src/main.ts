import { NestFactory } from '@nestjs/core';
import { Services/domainModule } from './services/domain.module';

async function bootstrap() {
  const app = await NestFactory.create(Services/domainModule);
  await app.listen(3000);
}
bootstrap();
