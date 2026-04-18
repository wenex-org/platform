import { getParam, loadMarkdownFile, ServerMCP, throwableResourceCall } from '@app/common/core/mcp';
import { JWT_SECRET, NODE_ENV, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { ComplexityPlugin, DateScalar } from '@app/common/core/plugins/graphql';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { BlacklistModule } from '@app/module/blacklist';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { McpModule } from './modules/mcp/mcp.module';
import { HealthModule } from '@app/module/health';
import { LoggerModule } from '@app/module/logger';
import { GraphQLModule } from '@nestjs/graphql';
import { RedisModule } from '@app/module/redis';
import GraphQLJSON from 'graphql-type-json';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';

import { MODULES, HEALTH_CHECK_OPTIONS } from './modules';

@Module({
  imports: [
    McpModule,
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
    const mcp = ServerMCP.create();

    mcp.server.registerResource(
      'documentations',
      new ResourceTemplate('docs://{directory}/{file}', {
        list: () => ({
          resources: [
            {
              description: 'Wenex core concepts.',
              ...{ uri: 'docs://schemas/core', name: 'core-schema' },
            },
          ],
        }),
      }),
      {
        name: 'documentations',
        mimeType: 'text/markdown',
        description: 'Wenex Documentations.',
      },
      async (uri, variables) =>
        throwableResourceCall(uri.href, async () => {
          const file = getParam(variables, 'file');
          const directory = getParam(variables, 'directory');
          const coreDocs = await loadMarkdownFile(`${directory}/${file}.md`);
          return { contents: [{ type: 'text', uri: uri.href, mimeType: 'text/markdown', text: coreDocs }] };
        }),
    );
  }
}
