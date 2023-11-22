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
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Metadata } from '@app/common/interfaces';
import { SetScope } from '@app/common/metadatas';
import { Meta } from '@app/common/decorators';
import { Scope } from '@app/common/enums';
import { Observable, from } from 'rxjs';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthorizationController {
  constructor(readonly provider: AuthProvider) {}

  @Post('can')
  @SetScope(Scope.ManageAuth)
  can(
    @Meta() meta: Metadata,
    @Body() data: AuthorizationCanRequestDto,
  ): Observable<AuthorizationCanResponseSerializer> {
    return from(this.provider.authorization.can(data, meta)).pipe(
      mapToInstance(AuthorizationCanResponseSerializer),
    );
  }

  @Post('policy')
  @SetScope(Scope.ManageAuth)
  policy(
    @Meta() meta: Metadata,
    @Body() data: AuthorizationPolicyRequestDto,
  ): Observable<AuthorizationPolicyResponseSerializer> {
    return from(this.provider.authorization.policy(data, meta)).pipe(
      mapToInstance(AuthorizationPolicyResponseSerializer),
    );
  }
}
