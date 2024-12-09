import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { JWT_SECRET, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { ComplexityPlugin, DateScalar } from '@app/common/core/plugins/graphql';
import { PromModule, METRICS_PLUGIN, TRACING_PLUGIN } from '@app/module/prom';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BlacklistModule } from '@app/module/blacklist';
import { DynamicModule, Module } from '@nestjs/common';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ApolloServerPlugin } from '@apollo/server';
import { HealthModule } from '@app/module/health';
import { GraphQLModule } from '@nestjs/graphql';
import { RedisModule } from '@app/module/redis';
import GraphQLJSON from 'graphql-type-json';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';

import * as modules from './modules';

@Module({
  imports: [
    PromModule.forRoot(),
    BlacklistModule.forRoot(),
    RedisModule.forRoot(REDIS_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),
    JwtModule.register({ secret: JWT_SECRET() }),
    HealthModule.forRoot(['disk', 'memory', 'redis', 'kafka']),

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
