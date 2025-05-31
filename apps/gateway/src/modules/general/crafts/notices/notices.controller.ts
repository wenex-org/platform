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
import { NoticeDataSerializer, NoticeItemsSerializer, NoticeSerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateNoticeDto, CreateNoticeItemsDto, UpdateNoticeDto } from '@app/common/dto/general';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Notice, NoticeDto } from '@app/common/interfaces/general';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { GeneralProvider } from '@app/common/providers/general';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('notices', 'general');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('general', 'notices')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class NoticesController extends ControllerClass<Notice, NoticeDto> implements IController<Notice, NoticeDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.notices, NoticeSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralNotices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralNotices)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: NoticeDataSerializer })
  @SetPolicy(Action.Create, Resource.GeneralNotices)
  override create(@Meta() meta: Metadata, @Body() data: CreateNoticeDto): Observable<NoticeDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: NoticeItemsSerializer })
  @SetPolicy(Action.Create, Resource.GeneralNotices)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateNoticeItemsDto): Observable<NoticeItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralNotices)
  @SetPolicy(Action.Read, Resource.GeneralNotices)
  @ApiResponse({ type: NoticeItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Notice>): Observable<NoticeItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadGeneralNotices)
  @SetPolicy(Action.Read, Resource.GeneralNotices)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: NoticeSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Notice>) {
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
  @SetScope(Scope.ReadGeneralNotices)
  @ApiResponse({ type: NoticeDataSerializer })
  @SetPolicy(Action.Read, Resource.GeneralNotices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Notice>): Observable<NoticeDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @ApiResponse({ type: NoticeDataSerializer })
  @SetPolicy(Action.Delete, Resource.GeneralNotices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Notice>): Observable<NoticeDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @ApiResponse({ type: NoticeDataSerializer })
  @SetPolicy(Action.Restore, Resource.GeneralNotices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Notice>): Observable<NoticeDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralNotices)
  @ApiResponse({ type: NoticeDataSerializer })
  @SetPolicy(Action.Destroy, Resource.GeneralNotices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Notice>): Observable<NoticeDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralNotices)
  @SetPolicy(Action.Update, Resource.GeneralNotices)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Notice>,
    @Body() update: UpdateNoticeDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @ApiResponse({ type: NoticeDataSerializer })
  @SetPolicy(Action.Update, Resource.GeneralNotices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Notice>,
    @Body() update: UpdateNoticeDto,
  ): Observable<NoticeDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
