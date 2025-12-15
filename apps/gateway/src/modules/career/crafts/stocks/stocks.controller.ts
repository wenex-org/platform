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
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { StockDataSerializer, StockItemsSerializer, StockSerializer } from '@app/common/serializers/career';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { CreateStockDto, CreateStockItemsDto, UpdateStockDto } from '@app/common/dto/career';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { Stock, StockDto } from '@app/common/interfaces/career';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { CareerProvider } from '@app/common/providers/career';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('stocks', 'career');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('career', 'stocks')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StocksController extends ControllerClass<Stock, StockDto> implements IController<Stock, StockDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.stocks, StockSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStocks)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerStocks)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/stocks', 'create')
  @ApiResponse({ type: StockDataSerializer })
  @SetPolicy(Action.Create, Resource.CareerStocks)
  override create(@Meta() meta: Metadata, @Body() data: CreateStockDto): Observable<StockDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/stocks', 'create')
  @ApiResponse({ type: StockItemsSerializer })
  @SetPolicy(Action.Create, Resource.CareerStocks)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateStockItemsDto): Observable<StockItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStocks)
  @SetPolicy(Action.Read, Resource.CareerStocks)
  @ApiResponse({ type: StockItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stock>): Observable<StockItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadCareerStocks)
  @SetPolicy(Action.Read, Resource.CareerStocks)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: StockSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Stock>) {
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
  @SetScope(Scope.ReadCareerStocks)
  @ApiResponse({ type: StockDataSerializer })
  @SetPolicy(Action.Read, Resource.CareerStocks)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Stock>): Observable<StockDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @ApiResponse({ type: StockDataSerializer })
  @SetPolicy(Action.Delete, Resource.CareerStocks)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stock>): Observable<StockDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @ApiResponse({ type: StockDataSerializer })
  @SetPolicy(Action.Restore, Resource.CareerStocks)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stock>): Observable<StockDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerStocks)
  @ApiResponse({ type: StockDataSerializer })
  @SetPolicy(Action.Destroy, Resource.CareerStocks)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stock>): Observable<StockDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerStocks)
  @Validation('career/stocks', 'update')
  @SetPolicy(Action.Update, Resource.CareerStocks)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Stock>,
    @Body() update: UpdateStockDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @Validation('career/stocks', 'update')
  @ApiResponse({ type: StockDataSerializer })
  @SetPolicy(Action.Update, Resource.CareerStocks)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stock>,
    @Body() update: UpdateStockDto,
  ): Observable<StockDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
