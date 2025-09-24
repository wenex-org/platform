import { Body, Controller, Get, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthenticationSerializer, AuthorizationSerializer } from '@app/common/serializers/auth';
import { AuthCheckDto, AuthenticationDto, AuthorizationDto } from '@app/common/dto/auth';
import { JwtTokenSerializer } from '@app/common/core/serializers/auth';
import { GatewayInterceptors } from '@app/common/core/interceptors';
import { IsPublic, RateLimit } from '@app/common/core/metadatas';
import { ResultSerializer } from '@app/common/core/serializers';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AuthProvider } from '@app/common/providers/auth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from '@app/common/core/pipes';
import { mapToInstance } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { AuthGuard } from '@app/common/core/guards';
import { Meta } from '@app/common/core/decorators';
import { from, map, Observable } from 'rxjs';

@ApiTags('auth')
@RateLimit('auth')
@Controller('auth')
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AuthsController {
  constructor(readonly provider: AuthProvider) {}

  @Get('check')
  @ApiBearerAuth()
  check(@Meta() meta: Metadata, @Body() data: AuthCheckDto): Observable<ResultSerializer> {
    return from(this.provider.auths.check(data, { meta })).pipe(
      map((val) => ({ result: val })),
      mapToInstance(ResultSerializer),
    );
  }

  // ##############################
  //  Authentication Method's
  // ##############################

  @IsPublic()
  @Post('token')
  token(@Meta() meta: Metadata, @Body() data: AuthenticationDto): Observable<AuthenticationSerializer> {
    return from(this.provider.auths.token(data, { meta })).pipe(mapToInstance(AuthenticationSerializer));
  }

  @Get('verify')
  @ApiBearerAuth()
  verify(@Meta() meta: Metadata): Observable<JwtTokenSerializer> {
    return from(this.provider.auths.verify({ meta })).pipe(mapToInstance(JwtTokenSerializer));
  }

  @Get('logout')
  @ApiBearerAuth()
  logout(@Meta() meta: Metadata): Observable<ResultSerializer> {
    return from(this.provider.auths.logout({ meta })).pipe(
      map((val) => ({ result: val })),
      mapToInstance(ResultSerializer),
    );
  }

  // ##############################
  //  Authorization Method's
  // ##############################

  @Post('can')
  @ApiBearerAuth()
  can(@Meta() meta: Metadata, @Body() data: AuthorizationDto): Observable<AuthorizationSerializer> {
    return from(this.provider.auths.can(data, { meta })).pipe(mapToInstance(AuthorizationSerializer));
  }
}
