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
import { PusHistoryDataSerializer, PusHistoryItemsSerializer, PusHistorySerializer } from '@app/common/serializers/touch';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreatePusHistoryDto, CreatePusHistoryItemsDto, UpdatePusHistoryDto } from '@app/common/dto/touch';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { PusHistory, PusHistoryDto } from '@app/common/interfaces/touch';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@RateLimit('push-histories')
@UseFilters(AllExceptionsFilter)
@ApiTags(Collection.PusHistories)
@Controller(Collection.PusHistories)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PusHistoriesController
  extends ControllerClass<PusHistory, PusHistoryDto>
  implements IController<PusHistory, PusHistoryDto>
{
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes.histories, PusHistorySerializer);
  }

  @Get('count')
  @Cache(Collection.PusHistories, 'fill')
  @SetScope(Scope.ReadTouchPusHistories)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchPusHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(Collection.PusHistories, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: PusHistoryDataSerializer })
  @SetPolicy(Action.Create, Resource.TouchPusHistories)
  override create(@Meta() meta: Metadata, @Body() data: CreatePusHistoryDto): Observable<PusHistoryDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(Collection.PusHistories, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: PusHistoryItemsSerializer })
  @SetPolicy(Action.Create, Resource.TouchPusHistories)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreatePusHistoryItemsDto): Observable<PusHistoryItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.PusHistories, 'fill')
  @SetScope(Scope.ReadTouchPusHistories)
  @SetPolicy(Action.Read, Resource.TouchPusHistories)
  @ApiResponse({ type: PusHistoryItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<PusHistory>): Observable<PusHistoryItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchPusHistories)
  @SetPolicy(Action.Read, Resource.TouchPusHistories)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: PusHistorySerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<PusHistory>) {
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
  @Cache(Collection.PusHistories, 'fill')
  @SetScope(Scope.ReadTouchPusHistories)
  @ApiResponse({ type: PusHistoryDataSerializer })
  @SetPolicy(Action.Read, Resource.TouchPusHistories)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<PusHistory>): Observable<PusHistoryDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.PusHistories, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @ApiResponse({ type: PusHistoryDataSerializer })
  @SetPolicy(Action.Delete, Resource.TouchPusHistories)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<PusHistory>): Observable<PusHistoryDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.PusHistories, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @ApiResponse({ type: PusHistoryDataSerializer })
  @SetPolicy(Action.Restore, Resource.TouchPusHistories)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<PusHistory>): Observable<PusHistoryDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.PusHistories, 'flush')
  @SetScope(Scope.ManageTouchPusHistories)
  @ApiResponse({ type: PusHistoryDataSerializer })
  @SetPolicy(Action.Destroy, Resource.TouchPusHistories)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<PusHistory>): Observable<PusHistoryDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(Collection.PusHistories, 'flush')
  @SetScope(Scope.ManageTouchPusHistories)
  @SetPolicy(Action.Update, Resource.TouchPusHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<PusHistory>,
    @Body() update: UpdatePusHistoryDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(Collection.PusHistories, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @ApiResponse({ type: PusHistoryDataSerializer })
  @SetPolicy(Action.Update, Resource.TouchPusHistories)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PusHistory>,
    @Body() update: UpdatePusHistoryDto,
  ): Observable<PusHistoryDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
