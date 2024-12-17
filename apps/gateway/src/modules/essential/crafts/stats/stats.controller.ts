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
import { StatDataSerializer, StatItemsSerializer, StatSerializer } from '@app/common/serializers/essential';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateStatDto, CreateStatItemsDto, UpdateStatDto } from '@app/common/dto/essential';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { EssentialProvider } from '@app/common/providers/essential';
import { Stat, StatDto } from '@app/common/interfaces/essential';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('stats')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Stats)
@Controller(Collection.Stats)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsController extends ControllerClass<Stat, StatDto> implements IController<Stat, StatDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.stats, StatSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadEssentialStats)
  @Cache(Collection.Stats, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialStats)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Create, Resource.EssentialStats)
  override create(@Meta() meta: Metadata, @Body() data: CreateStatDto): Observable<StatDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: StatItemsSerializer })
  @SetPolicy(Action.Create, Resource.EssentialStats)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateStatItemsDto): Observable<StatItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadEssentialStats)
  @Cache(Collection.Stats, 'fill')
  @SetPolicy(Action.Read, Resource.EssentialStats)
  @ApiResponse({ type: StatItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadEssentialStats)
  @SetPolicy(Action.Read, Resource.EssentialStats)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.ReadEssentialStats)
  @Cache(Collection.Stats, 'fill')
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Read, Resource.EssentialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Stat>): Observable<StatDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Delete, Resource.EssentialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Restore, Resource.EssentialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @SetScope(Scope.ManageEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Destroy, Resource.EssentialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @SetScope(Scope.ManageEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @SetPolicy(Action.Update, Resource.EssentialStats)
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
  @ShipStrategy('update')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @ApiResponse({ type: StatDataSerializer })
  @SetPolicy(Action.Update, Resource.EssentialStats)
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
