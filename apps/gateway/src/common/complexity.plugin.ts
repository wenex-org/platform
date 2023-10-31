import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { MAXIMUM_GRAPHQL_QUERY_COMPLEXITY } from '@app/common/consts';
import { toKebabCase } from 'naming-conventions-modeler';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { date, logger } from '@app/common/utils';
import { Plugin } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  private readonly log = logger(ComplexityPlugin.name);

  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const { schema } = this.gqlSchemaHost;

    return {
      didResolveOperation: async ({ request, document }) => {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity >= MAXIMUM_GRAPHQL_QUERY_COMPLEXITY) {
          throw new GraphQLError(
            `Query is too complex ${complexity}, Maximum allowed complexity is ${MAXIMUM_GRAPHQL_QUERY_COMPLEXITY}`,
          );
        }

        this.log
          .get(toKebabCase(this.requestDidStart.name))
          .info(date(`GraphQL Query Complexity is ${complexity}`));
      },
    };
  }
}
