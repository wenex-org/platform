import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { JWT_SECRET, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/configs';
import { METRICS_PLUGIN, PromModule, TRACING_PLUGIN } from '@app/prom';
import { ComplexityPlugin, DateScalar } from '@app/common/plugins';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Module } from '@nestjs/common';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLModule } from '@nestjs/graphql';
import { RedisModule } from '@app/sdk/redis';
import GraphQLJSON from 'graphql-type-json';
import { HealthModule } from '@app/health';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';

import * as modules from './modules';

@Module({
  imports: [
    HealthModule.forRoot(['disk', 'memory', 'redis', 'kafka']),

    PromModule.forRoot(),
    RedisModule.forRoot(REDIS_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),
    JwtModule.register({ secret: JWT_SECRET(), global: true }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (
        // Use provided plugins injected from below
        tracingPlugin: ApolloServerPlugin,
        metricsPlugin: ApolloServerPlugin,
      ) => ({
        debug: true,
        tracing: true, // Required for plugins
        playground: false,
        introspection: true, // Required for plugins
        resolvers: { JSON: GraphQLJSON },
        subscriptions: { 'graphql-ws': true },
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        // Plugins added to apollo server
        plugins: [tracingPlugin, metricsPlugin, ApolloServerPluginLandingPageLocalDefault()],
      }),
      // We need to inject the provider keys
      inject: [TRACING_PLUGIN, METRICS_PLUGIN],
    }),

    ...(Object.values(modules) as unknown as DynamicModule[]),
  ],
  providers: [DateScalar, ComplexityPlugin],
})
export class AppModule {}
