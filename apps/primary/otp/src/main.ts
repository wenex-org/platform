import { NestFactory } from '@nestjs/core';
import { OtpModule } from './otp.module';

async function bootstrap() {
  const app = await NestFactory.create(OtpModule);
  await app.listen(3000);
}
bootstrap();
