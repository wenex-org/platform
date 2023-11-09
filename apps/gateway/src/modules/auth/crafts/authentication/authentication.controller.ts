import {
  AuthenticationResponseSerializer,
  ResultSerializer,
  JwtTokenSerializer,
} from '@app/common/serializers';
import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthenticationRequestDto, TokenDto } from '@app/common/dto';
import { GrpcAuthenticationController } from '@app/common/classes';
import { AuthGuard, ScopeGuard } from '@app/common/guards';
import { IsPublic, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { Scope } from '@app/common/enums';
import { Observable } from 'rxjs';

@ApiTags('auth')
@Controller('auth')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard)
@UseInterceptors(new SentryInterceptor())
export class AuthenticationController extends GrpcAuthenticationController {
  constructor(readonly provider: AuthProvider) {
    super(provider.authentication);
  }

  @IsPublic()
  @Post('token')
  token(
    @Meta() meta: Metadata,
    @Body() data: AuthenticationRequestDto,
  ): Observable<AuthenticationResponseSerializer> {
    return super.token(meta, data).pipe(mapToInstance(AuthenticationResponseSerializer));
  }

  @Post('logout')
  @ApiBearerAuth()
  @SetScope(Scope.ManageAuth)
  logout(@Meta() meta: Metadata, @Body() data: TokenDto): Observable<ResultSerializer> {
    return super.logout(meta, data).pipe(mapToInstance(ResultSerializer));
  }

  @Post('verify')
  @ApiBearerAuth()
  @SetScope(Scope.ManageAuth)
  verify(@Meta() meta: Metadata, @Body() data: TokenDto): Observable<JwtTokenSerializer> {
    return super.verify(meta, data).pipe(mapToInstance(JwtTokenSerializer));
  }
}
