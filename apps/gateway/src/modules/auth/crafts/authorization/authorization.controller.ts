import {
  AuthorizationCanResponseSerializer,
  AuthorizationPolicyResponseSerializer,
} from '@app/common/serializers';
import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  AuthorizationCanRequestDto,
  AuthorizationPolicyRequestDto,
} from '@app/common/dto';
import { GrpcAuthorizationController } from '@app/common/classes';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthorizationController extends GrpcAuthorizationController {
  constructor(readonly provider: AuthProvider) {
    super(provider.authorization);
  }

  @Post('can')
  can(
    @Meta() meta: Metadata,
    @Body() data: AuthorizationCanRequestDto,
  ): Observable<AuthorizationCanResponseSerializer> {
    return super.can(meta, data).pipe(mapToInstance(AuthorizationCanResponseSerializer));
  }

  @Post('policy')
  policy(
    @Meta() meta: Metadata,
    @Body() data: AuthorizationPolicyRequestDto,
  ): Observable<AuthorizationPolicyResponseSerializer> {
    return super
      .policy(meta, data)
      .pipe(mapToInstance(AuthorizationPolicyResponseSerializer));
  }
}
