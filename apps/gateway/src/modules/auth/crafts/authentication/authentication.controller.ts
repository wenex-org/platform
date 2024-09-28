import { AuthenticationResponseSerializer, ResultSerializer, JwtTokenSerializer } from '@app/common/serializers';
import { Body, Controller, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthenticationRequestDto, TokenDto } from '@app/common/dto';
import { GatewayInterceptors } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Metadata } from '@app/common/interfaces';
import { IsPublic } from '@app/common/metadatas';
import { AuthGuard } from '@app/common/guards';
import { Meta } from '@app/common/decorators';
import { Observable, from } from 'rxjs';

@ApiTags('auth')
@Controller('auth')
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AuthenticationController {
  constructor(readonly provider: AuthProvider) { }

  @IsPublic()
  @Post('token')
  token(@Meta() meta: Metadata, @Body() data: AuthenticationRequestDto): Observable<AuthenticationResponseSerializer> {
    return from(this.provider.authentication.token(data, meta)).pipe(mapToInstance(AuthenticationResponseSerializer));
  }

  @Post('verify')
  @ApiBearerAuth()
  verify(@Meta() meta: Metadata, @Body() data: TokenDto): Observable<JwtTokenSerializer> {
    return from(this.provider.authentication.verify(data, meta)).pipe(mapToInstance(JwtTokenSerializer));
  }

  @Post('logout')
  @ApiBearerAuth()
  logout(@Meta() meta: Metadata, @Body() data: TokenDto): Observable<ResultSerializer> {
    return from(this.provider.authentication.logout(data, meta)).pipe(mapToInstance(ResultSerializer));
  }
}
