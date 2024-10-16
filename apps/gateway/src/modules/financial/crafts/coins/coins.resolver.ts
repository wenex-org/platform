import { CreateCoinDto, CreateCoinItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateCoinDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, CoinDataSerializer, CoinItemsSerializer, CoinSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Coin, CoinDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FinancialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => CoinSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CoinsResolver extends ControllerClass<Coin, CoinDto> implements ControllerInterface<Coin, CoinDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.coins, () => CoinSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Coins, 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  countCoin(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => CoinDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCoins)
  createCoin(@Meta() meta: Metadata, @Args('data') data: CreateCoinDto): Observable<CoinDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => CoinItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCoins)
  createBulkCoin(@Meta() meta: Metadata, @Args('data') data: CreateCoinItemsDto): Observable<CoinItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => CoinItemsSerializer)
  @Cache(Collection.Coins, 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findCoin(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Coin>): Observable<CoinItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => CoinDataSerializer)
  @Cache(Collection.Coins, 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneCoin(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Coin>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => CoinDataSerializer)
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Delete, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneCoin(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => CoinDataSerializer)
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Restore, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneCoin(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => CoinDataSerializer)
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.ManageFinancialCoins)
  @SetPolicy(Action.Destroy, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneCoin(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => CoinDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Update, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneCoin(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Coin>,
    @Args('data') update: UpdateCoinDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.ManageFinancialCoins)
  @SetPolicy(Action.Update, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkCoin(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Coin>,
    @Args('data') update: UpdateCoinDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
