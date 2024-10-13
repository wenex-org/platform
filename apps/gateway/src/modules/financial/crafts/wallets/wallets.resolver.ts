import { CreateWalletDto, CreateWalletItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateWalletDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, WalletDataSerializer, WalletItemsSerializer, WalletSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Wallet, WalletDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FinancialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => WalletSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class WalletsResolver extends ControllerClass<Wallet, WalletDto> implements ControllerInterface<Wallet, WalletDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.wallets, () => WalletSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('wallets', 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  countWallet(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @ShipStrategy('create')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  createWallet(@Meta() meta: Metadata, @Args('data') data: CreateWalletDto): Observable<WalletDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => WalletItemsSerializer)
  @ShipStrategy('create')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  createBulkWallet(@Meta() meta: Metadata, @Args('data') data: CreateWalletItemsDto): Observable<WalletItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => WalletItemsSerializer)
  @Cache('wallets', 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findWallet(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Wallet>): Observable<WalletItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => WalletDataSerializer)
  @Cache('wallets', 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneWallet(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Wallet>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Delete, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneWallet(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Restore, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneWallet(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @Cache('wallets', 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @SetPolicy(Action.Destroy, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneWallet(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => WalletDataSerializer)
  @ShipStrategy('update')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneWallet(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Wallet>,
    @Args('data') update: UpdateWalletDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('wallets', 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkWallet(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Wallet>,
    @Args('data') update: UpdateWalletDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
