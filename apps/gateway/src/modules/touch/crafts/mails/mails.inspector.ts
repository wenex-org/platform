import { Body, Controller, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MailSerializer } from '@app/common/serializers';
import { TouchProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { Metadata } from '@app/common/interfaces';
import { CreateMailDto } from '@app/common/dto';
import { Meta } from '@app/common/decorators';

@ApiBearerAuth()
@ApiTags('mails')
@Controller('mails')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MailsInspector {
  constructor(readonly provider: TouchProvider) {}

  @Post('send')
  @ShipStrategy('create')
  @SetScope(Scope.SendTouchMails)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Send, Resource.TouchMails)
  async send(@Meta() meta: Metadata, @Body() data: CreateMailDto): Promise<MailSerializer> {
    return this.provider.mails.send(data, meta);
  }
}
