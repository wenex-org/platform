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
import { CollectStatDto, CreateStatDto, CreateStatItemsDto, UpdateStatDto } from '@app/common/dto/special';
import { StatDataSerializer, StatItemsSerializer, StatSerializer } from '@app/common/serializers/special';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { ResultSerializer, TotalSerializer } from '@app/common/core/serializers';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { SpecialProvider } from '@app/common/providers/special';
import { Stat, StatDto } from '@app/common/interfaces/special';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable } from 'rxjs';
import { Response } from 'express';

@ApiBearerAuth()
@RateLimit('stats')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Stats)
@Controller(Collection.Stats)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsController extends ControllerClass<Stat, StatDto> implements IController<Stat, StatDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.stats, StatSerializer);
  }

  @Post('collect')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.CollectSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: StatItemsSerializer })
  @SetPolicy(Action.Collect, Resource.SpecialStats)
  collect(@Meta() meta: Metadata, @Body() data: CollectStatDto): Observable<StatItemsSerializer> {
    return from(this.provider.stats.collect(data, { meta })).pipe(mapToInstance(StatSerializer, 'items'));
  }

  @Post('stackup')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.CollectSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ResultSerializer })
  @SetPolicy(Action.Collect, Resource.SpecialStats)
  stackup(@Meta() meta: Metadata, @Body() data: CollectStatDto): Observable<ResultSerializer> {
    return from(this.provider.stats.stackup(data, { meta })).pipe(mapToInstance(ResultSerializer));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(Collection.Stats, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Create, Resource.SpecialStats)
  override create(@Meta() meta: Metadata, @Body() data: CreateStatDto): Observable<StatDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: StatItemsSerializer })
  @SetPolicy(Action.Create, Resource.SpecialStats)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateStatItemsDto): Observable<StatItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Stats, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiResponse({ type: StatItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: StatSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Stat>) {
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
  @Cache(Collection.Stats, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Stat>): Observable<StatDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Delete, Resource.SpecialStats)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Restore, Resource.SpecialStats)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Destroy, Resource.SpecialStats)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Stat>,
    @Body() update: UpdateStatDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Body() update: UpdateStatDto,
  ): Observable<StatDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
