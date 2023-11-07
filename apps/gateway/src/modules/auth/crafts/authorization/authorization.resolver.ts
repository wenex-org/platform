import {
  AuthorizationCanResponseSerializer,
  AuthorizationPolicyResponseSerializer,
} from '@app/common/serializers';
import {
  AuthorizationCanRequestDto,
  AuthorizationPolicyRequestDto,
} from '@app/common/dto';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { GrpcAuthorizationController } from '@app/common/classes';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { AuthProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => AuthorizationCanResponseSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthorizationResolver extends GrpcAuthorizationController {
  constructor(readonly provider: AuthProvider) {
    super(provider.authorization);
  }

  @Mutation(() => AuthorizationCanResponseSerializer)
  can(
    @Meta() meta: Metadata,
    @Args('data') data: AuthorizationCanRequestDto,
  ): Observable<AuthorizationCanResponseSerializer> {
    return super.can(meta, data).pipe(mapToInstance(AuthorizationCanResponseSerializer));
  }

  @Mutation(() => AuthorizationPolicyResponseSerializer)
  policy(
    @Meta() meta: Metadata,
    @Args('data') data: AuthorizationPolicyRequestDto,
  ): Observable<AuthorizationPolicyResponseSerializer> {
    return super
      .policy(meta, data)
      .pipe(mapToInstance(AuthorizationPolicyResponseSerializer));
  }
}
