/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

if (process.env.NODE_ENV?.toLowerCase().startsWith('prod')) {
  if (process.env.ELASTIC_APM_SERVICE_NAME) require('elastic-apm-node').start();
  else throw Error('in production mode ELASTIC_APM_SERVICE_NAME is required.');
  require('tracing').init(['http', 'grpc', 'graphql']);
}

import {
  ETagInterceptor,
  NoApiResponseInterceptor,
  XPoweredByInterceptor,
  XRequestIdInterceptor,
} from '@app/common/core/interceptors';
import { NamingConventionReqInterceptor } from '@app/common/core/interceptors/n-convention';
import { prototyping, setupSwagger } from '@app/common/core/utils';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/core';
import helmet from 'helmet';
import qs from 'qs';

prototyping('GATEWAY');
import { AppModule } from './app.module';

const { GATEWAY } = APP;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableShutdownHooks();

  app.use(helmet({ contentSecurityPolicy: false }));

  const express = app.getHttpAdapter().getInstance();
  express.set('etag', false);
  express.set('query parser', qs.parse);

  app.useGlobalInterceptors(
    new XRequestIdInterceptor(),
    new XPoweredByInterceptor(),
    new ETagInterceptor(),
    new NoApiResponseInterceptor(),
    new NamingConventionReqInterceptor(),
  );

  setupSwagger(app);

  await app.listen(GATEWAY.API_PORT, '0.0.0.0');

  const url = await app.getUrl();
  console.log(`Gateway Successfully Started On Port ${GATEWAY.API_PORT}`);
  console.log(`Swagger UI is running on: ${url}/api`);
  console.log(`Prometheus is running on: ${url}/metrics`);
  console.log(`Health check is running on: ${url}/status`);
  console.log(`OpenApi Spec is running on: ${url}/api-json`);
  console.log(`GraphQL playground is running on: ${url}/graphql`);
}
void bootstrap();
