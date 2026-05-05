import { mcpInputSchema, mcpOutputSchema, throwableToolCall } from '@app/common/core/mcp';
import { JWT_SECRET, NODE_ENV, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { mcpDocLoader, registerDocumentations } from '@app/common/core/mcp/loader.mcp';
import { ComplexityPlugin, DateScalar } from '@app/common/core/plugins/graphql';
import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { BlacklistModule } from '@app/module/blacklist';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { HealthModule } from '@app/module/health';
import { LoggerModule } from '@app/module/logger';
import { GraphQLModule } from '@nestjs/graphql';
import { RedisModule } from '@app/module/redis';
import GraphQLJSON from 'graphql-type-json';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { z } from 'zod';

import { MODULES, HEALTH_CHECK_OPTIONS } from './modules';

@Module({
  imports: [
    LoggerModule.forRoot(),
    BlacklistModule.forRoot(),
    PrometheusModule.register(),

    RedisModule.forRoot(REDIS_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),

    JwtModule.register({ secret: JWT_SECRET(), global: true }),
    HealthModule.forRoot(['redis', 'kafka', ...HEALTH_CHECK_OPTIONS]),

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

    ...(Object.values(MODULES) as unknown as DynamicModule[]),
  ],
  providers: [DateScalar, ComplexityPlugin],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    const mcp = registerDocumentations();

    mcp.server.registerTool(
      'read_docs',
      {
        title: 'read documentations',
        description: 'documentations read using uri',
        inputSchema: mcpInputSchema({ body: { uri: z.string() } }),
        outputSchema: mcpOutputSchema({ result: { content: z.string() } }),
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      },
      (args) =>
        throwableToolCall(() => {
          let content = '';
          if (args.uri === 'docs://readme') content = mcpDocLoader(`docs://readme`, null);
          else if (args.uri === 'docs://core/specification') {
            content = mcpDocLoader(args.uri.replace('core/specification', 'core/-specification'));
          } else content = mcpDocLoader(args.uri);
          return {
            structuredContent: { result: { content } },
            content: [{ type: 'text', text: `Look at structured data.` }],
          };
        }),
    );
  }
}
