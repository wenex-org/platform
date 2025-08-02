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
import { GatewayInterceptors, WriteInterceptors, ResponseInterceptors } from '@app/common/core/interceptors';
import { EmailDataSerializer, EmailItemsSerializer, EmailSerializer } from '@app/common/serializers/touch';
import { CreateEmailDto, CreateEmailItemsDto, SendEmailDto, UpdateEmailDto } from '@app/common/dto/touch';
import { Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { Email, EmailDto } from '@app/common/interfaces/touch';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('emails', 'touch');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('touch', 'emails')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class EmailsController extends ControllerClass<Email, EmailDto> implements IController<Email, EmailDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.emails, EmailSerializer);
  }

  @Post('send')
  @Cache(COLL_PATH, 'flush')
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
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @Validation('touch/emails', 'create')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Create, Resource.TouchEmails)
  override create(@Meta() meta: Metadata, @Body() data: CreateEmailDto): Observable<EmailDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @Validation('touch/emails', 'create')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: EmailItemsSerializer })
  @SetPolicy(Action.Create, Resource.TouchEmails)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateEmailItemsDto): Observable<EmailItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiResponse({ type: EmailItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchEmails)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: EmailSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Email>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super
      .cursor(meta, filter)
      .pipe(switchMap((value) => perm.filter(value)))
      .subscribe({
        next: (data) => res.write(getSseMessage({ id: data.id, data })),
        error: (data) => res.end(getSseMessage({ event: 'error', data })),
        complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
      });
  }

  @Get(':id')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Email>): Observable<EmailDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Delete, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Restore, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchEmails)
  @ApiResponse({ type: EmailDataSerializer })
  @SetPolicy(Action.Destroy, Resource.TouchEmails)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Email>): Observable<EmailDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchEmails)
  @Validation('touch/emails', 'update')
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
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @Validation('touch/emails', 'update')
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
