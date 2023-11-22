import {
  AuthenticationResponseSerializer,
  ResultSerializer,
  JwtTokenSerializer,
} from '@app/common/serializers';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthenticationRequestDto, TokenDto } from '@app/common/dto';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { AuthProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { Observable, from } from 'rxjs';

@Resolver(() => AuthenticationResponseSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthenticationResolver {
  constructor(readonly provider: AuthProvider) {}

  @Mutation(() => AuthenticationResponseSerializer)
  token(
    @Meta() meta: Metadata,
    @Args('data') data: AuthenticationRequestDto,
  ): Observable<AuthenticationResponseSerializer> {
    return from(this.provider.authentication.token(data, meta)).pipe(
      mapToInstance(AuthenticationResponseSerializer),
    );
  }

  @Mutation(() => JwtTokenSerializer)
  verify(
    @Meta() meta: Metadata,
    @Args('data') data: TokenDto,
  ): Observable<JwtTokenSerializer> {
    return from(this.provider.authentication.verify(data, meta)).pipe(
      mapToInstance(JwtTokenSerializer),
    );
  }

  @Mutation(() => ResultSerializer)
  logout(
    @Meta() meta: Metadata,
    @Args('data') data: TokenDto,
  ): Observable<ResultSerializer> {
    return from(this.provider.authentication.logout(data, meta)).pipe(
      mapToInstance(ResultSerializer),
    );
  }
}
