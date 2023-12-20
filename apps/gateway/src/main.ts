/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
require('log-node')();

import {
  NamingConventionsInterceptor,
  XRequestIdInterceptor,
} from '@app/common/interceptors';
import { setupSwagger, prototyping } from '@app/common/utils';
import { NODE_ENV } from '@app/common/configs';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/consts';
import { initTracing } from 'tracing';
import helmet from 'helmet';

import { AppModule } from './app.module';

const { GATEWAY } = APP;

prototyping();
async function bootstrap() {
  if (NODE_ENV().IS_PROD) await initTracing(['http', 'grpc', 'kafka']);

  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(helmet({ contentSecurityPolicy: false }));

  app.useGlobalInterceptors(
    new XRequestIdInterceptor(),
    new NamingConventionsInterceptor(),
  );

  setupSwagger(app);

  await app.listen(GATEWAY.API_PORT);

  const url = await app.getUrl();
  console.log(`Gateway Successfully Started On Port ${GATEWAY.API_PORT}`);
  console.log(`Swagger UI is running on: ${url}/api`);
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`OpenApi Spec is running on: ${url}/api-json`);
  console.log(`GraphQL playground is running on: ${url}/graphql`);
}
bootstrap();
