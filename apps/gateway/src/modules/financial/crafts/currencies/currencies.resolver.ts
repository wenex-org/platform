import { CurrencyDataSerializer, CurrencyItemsSerializer, CurrencySerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateCurrencyDto, CreateCurrencyItemsDto, UpdateCurrencyDto } from '@app/common/dto/financial';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Currency, CurrencyDto } from '@app/common/interfaces/financial';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FinancialProvider } from '@app/common/providers/financial';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => CurrencySerializer)
@RateLimit('currencies')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CurrenciesResolver extends ControllerClass<Currency, CurrencyDto> implements IController<Currency, CurrencyDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.currencies, CurrencySerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Currencies, 'fill')
  @SetScope(Scope.ReadFinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialCurrencies)
  countCurrency(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => CurrencyDataSerializer)
  @Cache(Collection.Currencies, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCurrencies)
  createCurrency(@Meta() meta: Metadata, @Args('data') data: CreateCurrencyDto): Observable<CurrencyDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => CurrencyItemsSerializer)
  @Cache(Collection.Currencies, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCurrencies)
  createCurrencyBulk(@Meta() meta: Metadata, @Args('data') data: CreateCurrencyItemsDto): Observable<CurrencyItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => CurrencyItemsSerializer)
  @Cache(Collection.Currencies, 'fill')
  @SetScope(Scope.ReadFinancialCurrencies)
  @SetPolicy(Action.Read, Resource.FinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCurrency(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Currency>): Observable<CurrencyItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => CurrencyDataSerializer)
  @Cache(Collection.Currencies, 'fill')
  @SetScope(Scope.ReadFinancialCurrencies)
  @SetPolicy(Action.Read, Resource.FinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCurrencyById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Currency>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CurrencyDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => CurrencyDataSerializer)
  @Cache(Collection.Currencies, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @SetPolicy(Action.Delete, Resource.FinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCurrencyById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Currency>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CurrencyDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => CurrencyDataSerializer)
  @Cache(Collection.Currencies, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @SetPolicy(Action.Restore, Resource.FinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCurrencyById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Currency>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CurrencyDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => CurrencyDataSerializer)
  @Cache(Collection.Currencies, 'flush')
  @SetScope(Scope.ManageFinancialCurrencies)
  @SetPolicy(Action.Destroy, Resource.FinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCurrencyById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Currency>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CurrencyDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Currencies, 'flush')
  @SetScope(Scope.ManageFinancialCurrencies)
  @SetPolicy(Action.Update, Resource.FinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCurrencyBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateCurrencyDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Currency>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => CurrencyDataSerializer)
  @Cache(Collection.Currencies, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @SetPolicy(Action.Update, Resource.FinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCurrencyById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Currency>,
    @Args('data') update: UpdateCurrencyDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CurrencyDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
