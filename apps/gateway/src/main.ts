/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import { initTracing } from 'tracing';
import { ETagInterceptor, XPoweredByInterceptor, XRequestIdInterceptor } from '@app/common/core/interceptors';
import { NamingConventionReqInterceptor } from '@app/common/core/interceptors/n-convention';
import { prototyping, setupSwagger } from '@app/common/core/utils';
import { NODE_ENV } from '@app/common/core/envs';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/core';
import helmet from 'helmet';
import qs from 'qs';

prototyping('GATEWAY');
import { AppModule } from './app.module';

const { GATEWAY } = APP;
async function bootstrap() {
  if (NODE_ENV().IS_PROD) {
    require('elastic-apm-node').start();
    initTracing(['http', 'grpc', 'kafka']);
  }

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
    new NamingConventionReqInterceptor(),
  );

  setupSwagger(app);

  await app.listen(GATEWAY.API_PORT);

  const url = await app.getUrl();
  console.log(`Gateway Successfully Started On Port ${GATEWAY.API_PORT}`);
  console.log(`Swagger UI is running on: ${url}/api`);
  console.log(`Prometheus is running on: ${url}/metrics`);
  console.log(`Health check is running on: ${url}/status`);
  console.log(`OpenApi Spec is running on: ${url}/api-json`);
  console.log(`GraphQL playground is running on: ${url}/graphql`);
}
void bootstrap();
