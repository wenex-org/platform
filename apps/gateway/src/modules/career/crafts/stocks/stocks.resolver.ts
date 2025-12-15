import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { StockDataSerializer, StockItemsSerializer, StockSerializer } from '@app/common/serializers/career';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateStockDto, CreateStockItemsDto, UpdateStockDto } from '@app/common/dto/career';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Stock, StockDto } from '@app/common/interfaces/career';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { CareerProvider } from '@app/common/providers/career';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('stocks', 'career');

@Resolver(() => StockSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StocksResolver extends ControllerClass<Stock, StockDto> implements IController<Stock, StockDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.stocks, StockSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStocks)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerStocks)
  countCareerStock(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => StockDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/stocks', 'create')
  @SetPolicy(Action.Create, Resource.CareerStocks)
  createCareerStock(@Meta() meta: Metadata, @Args('data') data: CreateStockDto): Observable<StockDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => StockItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/stocks', 'create')
  @SetPolicy(Action.Create, Resource.CareerStocks)
  createCareerStockBulk(@Meta() meta: Metadata, @Args('data') data: CreateStockItemsDto): Observable<StockItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => StockItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStocks)
  @SetPolicy(Action.Read, Resource.CareerStocks)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerStock(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Stock>): Observable<StockItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => StockDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStocks)
  @SetPolicy(Action.Read, Resource.CareerStocks)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerStockById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stock>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StockDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => StockDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @SetPolicy(Action.Delete, Resource.CareerStocks)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerStockById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stock>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StockDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => StockDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @SetPolicy(Action.Restore, Resource.CareerStocks)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerStockById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stock>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StockDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => StockDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerStocks)
  @SetPolicy(Action.Destroy, Resource.CareerStocks)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerStockById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stock>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StockDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerStocks)
  @Validation('career/stocks', 'update')
  @SetPolicy(Action.Update, Resource.CareerStocks)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerStockBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateStockDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Stock>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => StockDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStocks)
  @Validation('career/stocks', 'update')
  @SetPolicy(Action.Update, Resource.CareerStocks)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerStockById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stock>,
    @Args('data') update: UpdateStockDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StockDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
