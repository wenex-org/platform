import { Body, Controller, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { Metadata, Result } from '@app/common/interfaces';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePushHistoryDto } from '@app/common/dto';
import { TouchProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { Meta } from '@app/common/decorators';

@ApiBearerAuth()
@ApiTags('push')
@Controller('push')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushesInspector {
  constructor(readonly provider: TouchProvider) {}

  @Post('send')
  @ShipStrategy('create')
  @SetScope(Scope.SendTouchPush)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Send, Resource.TouchPush)
  async send(@Meta() meta: Metadata, @Body() data: CreatePushHistoryDto): Promise<Result> {
    return this.provider.pushes.send(data, meta);
  }
}
