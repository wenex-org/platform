import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { EmailDataSerializer, EmailItemsSerializer, EmailSerializer } from '@app/common/serializers/touch';
import { CreateEmailDto, CreateEmailItemsDto, SendEmailDto, UpdateEmailDto } from '@app/common/dto/touch';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { TransformerPipe, ValidationPipe } from '@app/common/core/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { Email, EmailDto } from '@app/common/interfaces/touch';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable } from 'rxjs';
import { Response } from 'express';

@ApiBearerAuth()
@RateLimit('emails')
@ApiTags(Collection.Emails)
@Controller(Collection.Emails)
@UseFilters(AllExceptionsFilter)
@UsePipes(TransformerPipe, ValidationPipe)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class EmailsController extends ControllerClass<Email, EmailDto> implements IController<Email, EmailDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.emails, EmailSerializer);
  }

  @Post('send')
  @ShipStrategy('create')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.SendTouchEmails)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Send, Resource.TouchEmails)
  send(@Meta() meta: Metadata, @Body() data: SendEmailDto): Observable<EmailDataSerializer> {
    return from(this.provider.emails.send(data, { meta })).pipe(mapToInstance(EmailSerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(Collection.Emails, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Create, Resource.TouchEmails)
  override create(@Meta() meta: Metadata, @Body() data: CreateEmailDto): Observable<EmailDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: EmailItemsSerializer })
  @SetPolicy(Action.Create, Resource.TouchEmails)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateEmailItemsDto): Observable<EmailItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Emails, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiResponse({ type: EmailItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchEmails)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: EmailSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Email>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getSseMessage({ id: data.id, data })),
      error: (data) => res.end(getSseMessage({ event: 'error', data })),
      complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache(Collection.Emails, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Email>): Observable<EmailDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Delete, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Restore, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.ManageTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Destroy, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.ManageTouchEmails)
  @SetPolicy(Action.Update, Resource.TouchEmails)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Email>,
    @Body() update: UpdateEmailDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Update, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Email>,
    @Body() update: UpdateEmailDto,
  ): Observable<EmailDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
