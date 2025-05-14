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
import { ActivityDataSerializer, ActivityItemsSerializer, ActivitySerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateActivityDto, CreateActivityItemsDto, UpdateActivityDto } from '@app/common/dto/general';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Activity, ActivityDto } from '@app/common/interfaces/general';
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

@ApiBearerAuth()
@RateLimit('activities')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Activities)
@Controller(Collection.Activities)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ActivitiesController extends ControllerClass<Activity, ActivityDto> implements IController<Activity, ActivityDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.activities, ActivitySerializer);
  }

  @Get('count')
  @Cache(Collection.Activities, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ActivityDataSerializer })
  @SetPolicy(Action.Create, Resource.GeneralActivities)
  override create(@Meta() meta: Metadata, @Body() data: CreateActivityDto): Observable<ActivityDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ActivityItemsSerializer })
  @SetPolicy(Action.Create, Resource.GeneralActivities)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateActivityItemsDto): Observable<ActivityItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Activities, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @ApiResponse({ type: ActivityItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Activity>): Observable<ActivityItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadGeneralActivities)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: ActivitySerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Activity>) {
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
  @Cache(Collection.Activities, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @ApiResponse({ type: ActivityDataSerializer })
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Activity>): Observable<ActivityDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @ApiResponse({ type: ActivityDataSerializer })
  @SetPolicy(Action.Delete, Resource.GeneralActivities)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Activity>): Observable<ActivityDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @ApiResponse({ type: ActivityDataSerializer })
  @SetPolicy(Action.Restore, Resource.GeneralActivities)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Activity>): Observable<ActivityDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.ManageGeneralActivities)
  @ApiResponse({ type: ActivityDataSerializer })
  @SetPolicy(Action.Destroy, Resource.GeneralActivities)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Activity>): Observable<ActivityDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.ManageGeneralActivities)
  @SetPolicy(Action.Update, Resource.GeneralActivities)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Activity>,
    @Body() update: UpdateActivityDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @ApiResponse({ type: ActivityDataSerializer })
  @SetPolicy(Action.Update, Resource.GeneralActivities)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Activity>,
    @Body() update: UpdateActivityDto,
  ): Observable<ActivityDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
