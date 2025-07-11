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
import { SmsDataSerializer, SmsItemsSerializer, SmsSerializer } from '@app/common/serializers/touch';
import { CreateSmsDto, CreateSmsItemsDto, SendSmsDto, UpdateSmsDto } from '@app/common/dto/touch';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Sms, SmsDto } from '@app/common/interfaces/touch';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('smss', 'touch');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@ApiTags('touch', 'smss')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SmssController extends ControllerClass<Sms, SmsDto> implements IController<Sms, SmsDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.smss, SmsSerializer);
  }

  @Post('send')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.SendTouchSmss)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Send, Resource.TouchSmss)
  send(@Meta() meta: Metadata, @Body() data: SendSmsDto): Observable<SmsDataSerializer> {
    return from(this.provider.smss.send(data, { meta })).pipe(mapToInstance(SmsSerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Create, Resource.TouchSmss)
  override create(@Meta() meta: Metadata, @Body() data: CreateSmsDto): Observable<SmsDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SmsItemsSerializer })
  @SetPolicy(Action.Create, Resource.TouchSmss)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateSmsItemsDto): Observable<SmsItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiResponse({ type: SmsItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchSmss)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: SmsSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Sms>) {
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
  @SetScope(Scope.ReadTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Sms>): Observable<SmsDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Delete, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Restore, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Destroy, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchSmss)
  @SetPolicy(Action.Update, Resource.TouchSmss)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Sms>,
    @Body() update: UpdateSmsDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Update, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Sms>,
    @Body() update: UpdateSmsDto,
  ): Observable<SmsDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
