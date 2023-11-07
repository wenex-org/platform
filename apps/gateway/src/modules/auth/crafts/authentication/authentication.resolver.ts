import {
  AuthenticationResponseSerializer,
  ResultSerializer,
  JwtTokenSerializer,
} from '@app/common/serializers';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthenticationRequestDto, TokenDto } from '@app/common/dto';
import { GrpcAuthenticationController } from '@app/common/classes';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { AuthProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => AuthenticationResponseSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthenticationResolver extends GrpcAuthenticationController {
  constructor(readonly provider: AuthProvider) {
    super(provider.authentication);
  }

  @Mutation(() => AuthenticationResponseSerializer)
  token(
    @Meta() meta: Metadata,
    @Args('data') data: AuthenticationRequestDto,
  ): Observable<AuthenticationResponseSerializer> {
    return super.token(meta, data).pipe(mapToInstance(AuthenticationResponseSerializer));
  }

  @Mutation(() => ResultSerializer)
  logout(
    @Meta() meta: Metadata,
    @Args('data') data: TokenDto,
  ): Observable<ResultSerializer> {
    return super.logout(meta, data).pipe(mapToInstance(ResultSerializer));
  }

  @Mutation(() => JwtTokenSerializer)
  verify(
    @Meta() meta: Metadata,
    @Args('data') data: TokenDto,
  ): Observable<JwtTokenSerializer> {
    return super.verify(meta, data).pipe(mapToInstance(JwtTokenSerializer));
  }
}
