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
import {
  PushDataSerializer,
  PushItemsSerializer,
  PushSerializer,
  PusHistoryDataSerializer,
  PusHistorySerializer,
} from '@app/common/serializers/touch';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreatePushDto, CreatePushItemsDto, SendPusHistoryDto, UpdatePushDto } from '@app/common/dto/touch';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { Push, PushDto } from '@app/common/interfaces/touch';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('pushes', 'touch');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('touch', 'pushes')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushesController extends ControllerClass<Push, PushDto> implements IController<Push, PushDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes, PushSerializer);
  }

  @Post('send')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.SendTouchPushes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Send, Resource.TouchPushes)
  @ApiResponse({ type: PusHistoryDataSerializer })
  send(@Meta() meta: Metadata, @Body() data: SendPusHistoryDto): Observable<PusHistoryDataSerializer> {
    return from(this.provider.pushes.send(data, { meta })).pipe(mapToInstance(PusHistorySerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @Validation('touch/pushes', 'create')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: PushDataSerializer })
  @SetPolicy(Action.Create, Resource.TouchPushes)
  override create(@Meta() meta: Metadata, @Body() data: CreatePushDto): Observable<PushDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @Validation('touch/pushes', 'create')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: PushItemsSerializer })
  @SetPolicy(Action.Create, Resource.TouchPushes)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreatePushItemsDto): Observable<PushItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiResponse({ type: PushItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Push>): Observable<PushItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchPushes)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiQuery({ type: FilterOneDto, required: false })
  @ApiResponse({ status: HttpStatus.OK, type: PushSerializer })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Push>) {
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
  @SetScope(Scope.ReadTouchPushes)
  @ApiResponse({ type: PushDataSerializer })
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Push>): Observable<PushDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @ApiResponse({ type: PushDataSerializer })
  @SetPolicy(Action.Delete, Resource.TouchPushes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Push>): Observable<PushDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @ApiResponse({ type: PushDataSerializer })
  @SetPolicy(Action.Restore, Resource.TouchPushes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Push>): Observable<PushDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @ApiResponse({ type: PushDataSerializer })
  @SetPolicy(Action.Destroy, Resource.TouchPushes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Push>): Observable<PushDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @Validation('touch/pushes', 'update')
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Push>,
    @Body() update: UpdatePushDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @Validation('touch/pushes', 'update')
  @ApiResponse({ type: PushDataSerializer })
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Body() update: UpdatePushDto,
  ): Observable<PushDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
