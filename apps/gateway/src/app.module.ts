import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ComplexityPlugin, DateScalar } from '@app/common/plugins';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JWT_SECRET, REDIS_CONFIG } from '@app/common/configs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DynamicModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { HealthModule } from '@app/health';
import { RedisModule } from '@app/redis';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';

import * as modules from './modules';

@Module({
  imports: [
    ...(Object.values(modules) as unknown as DynamicModule[]),

    JwtModule.register({ secret: JWT_SECRET(), global: true }),

    PrometheusModule.register(),
    RedisModule.forRoot(REDIS_CONFIG()),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      playground: false,
      driver: ApolloDriver,
      resolvers: { JSON: GraphQLJSON },
      subscriptions: { 'graphql-ws': true },
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    HealthModule.forRoot(['disk', 'memory', 'mongo', 'redis', 'kafka']),
  ],
  providers: [DateScalar, ComplexityPlugin],
})
export class AppModule {}
