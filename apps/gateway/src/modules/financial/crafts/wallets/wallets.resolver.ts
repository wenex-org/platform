import { WalletDataSerializer, WalletItemsSerializer, WalletSerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateWalletDto, CreateWalletItemsDto, UpdateWalletDto } from '@app/common/dto/financial';
import { Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Wallet, WalletDto } from '@app/common/interfaces/financial';
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

const COLL_PATH = COLLECTION('wallets', 'financial');

@Resolver(() => WalletSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class WalletsResolver extends ControllerClass<Wallet, WalletDto> implements IController<Wallet, WalletDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.wallets, WalletSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  countFinancialWallet(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @UseInterceptors(...WriteInterceptors)
  @Validation('financial/wallets', 'create')
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  createFinancialWallet(@Meta() meta: Metadata, @Args('data') data: CreateWalletDto): Observable<WalletDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => WalletItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @UseInterceptors(...WriteInterceptors)
  @Validation('financial/wallets', 'create')
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  createFinancialWalletBulk(@Meta() meta: Metadata, @Args('data') data: CreateWalletItemsDto): Observable<WalletItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => WalletItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findFinancialWallet(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Wallet>,
  ): Observable<WalletItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => WalletDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findFinancialWalletById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Wallet>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Delete, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteFinancialWalletById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Restore, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreFinancialWalletById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @SetPolicy(Action.Destroy, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyFinancialWalletById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @Validation('financial/wallets', 'update')
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialWalletBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateWalletDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Wallet>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @Validation('financial/wallets', 'update')
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialWalletById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Wallet>,
    @Args('data') update: UpdateWalletDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
