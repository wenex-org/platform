import { JWT_SECRET, NODE_ENV, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { ComplexityPlugin, DateScalar } from '@app/common/core/plugins/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { BlacklistModule } from '@app/module/blacklist';
import { DynamicModule, Module } from '@nestjs/common';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { HealthModule } from '@app/module/health';
import { GraphQLModule } from '@nestjs/graphql';
import { RedisModule } from '@app/module/redis';
import GraphQLJSON from 'graphql-type-json';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';

import * as modules from './modules';

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),

    BlacklistModule.forRoot(),
    PrometheusModule.register(),

    RedisModule.forRoot(REDIS_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),

    JwtModule.register({ secret: JWT_SECRET(), global: true }),
    HealthModule.forRoot(['disk', 'memory', 'redis', 'kafka']),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => ({
        tracing: true,
        playground: true,
        introspection: true,
        resolvers: { JSON: GraphQLJSON },
        subscriptions: { 'graphql-ws': true },
        debug: NODE_ENV().IS_DEV ? true : false,
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
      }),
    }),

    ...(Object.values(modules) as unknown as DynamicModule[]),
  ],
  providers: [DateScalar, ComplexityPlugin],
})
export class AppModule {}
