import { Body, Controller, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SpecialProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { Metadata } from '@app/common/interfaces';
import { CreateStatDto } from '@app/common/dto';
import { Meta } from '@app/common/decorators';

@ApiBearerAuth()
@ApiTags('stats')
@Controller('stats')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsInspector {
  constructor(readonly provider: SpecialProvider) {}

  @Post('collect')
  @ShipStrategy('create')
  @SetScope(Scope.CollectSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Collect, Resource.SpecialStats)
  async collect(@Meta() meta: Metadata, @Body() data: CreateStatDto) {
    return this.provider.stats.collect(data, { meta });
  }
}
