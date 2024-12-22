import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthenticationSerializer, AuthorizationSerializer } from '@app/common/serializers/auth';
import { AuthenticationDto, AuthorizationDto } from '@app/common/dto/auth';
import { JwtTokenSerializer } from '@app/common/core/serializers/auth';
import { GatewayInterceptors } from '@app/common/core/interceptors';
import { IsPublic, RateLimit } from '@app/common/core/metadatas';
import { ResultSerializer } from '@app/common/core/serializers';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AuthProvider } from '@app/common/providers/auth';
import { mapToInstance } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { AuthGuard } from '@app/common/core/guards';
import { Meta } from '@app/common/core/decorators';
import { Args, Mutation } from '@nestjs/graphql';
import { from, Observable } from 'rxjs';

@RateLimit('auth')
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AuthsResolver {
  constructor(readonly provider: AuthProvider) {}

  // ##############################
  //  Authentication Method's
  // ##############################

  @IsPublic()
  @Mutation(() => AuthenticationSerializer)
  token(@Meta() meta: Metadata, @Args('data') data: AuthenticationDto): Observable<AuthenticationSerializer> {
    return from(this.provider.auths.token(data, { meta })).pipe(mapToInstance(AuthenticationSerializer));
  }

  @Mutation(() => JwtTokenSerializer)
  verify(@Meta() meta: Metadata): Observable<JwtTokenSerializer> {
    return from(this.provider.auths.verify({ meta })).pipe(mapToInstance(JwtTokenSerializer));
  }

  @Mutation(() => ResultSerializer)
  logout(@Meta() meta: Metadata): Observable<ResultSerializer> {
    return from(this.provider.auths.logout({ meta })).pipe(mapToInstance(ResultSerializer));
  }

  // ##############################
  //  Authorization Method's
  // ##############################

  @Mutation(() => AuthorizationSerializer)
  can(@Meta() meta: Metadata, @Args('data') data: AuthorizationDto): Observable<AuthorizationSerializer> {
    return from(this.provider.auths.can(data, { meta })).pipe(mapToInstance(AuthorizationSerializer));
  }
}
