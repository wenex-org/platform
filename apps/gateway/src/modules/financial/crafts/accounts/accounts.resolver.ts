import {
  CreateAccountDto,
  CreateAccountItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateAccountDto,
} from '@app/common/dto';
import { TotalSerializer, AccountDataSerializer, AccountItemsSerializer, AccountSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Account, AccountDto } from '@app/common/interfaces';
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

@Resolver(() => AccountSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AccountsResolver extends ControllerClass<Account, AccountDto> implements ControllerInterface<Account, AccountDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.accounts, () => AccountSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  countAccount(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createAccount(@Meta() meta: Metadata, @Args('data') data: CreateAccountDto): Observable<AccountDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => AccountItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Accounts, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createBulkAccount(@Meta() meta: Metadata, @Args('data') data: CreateAccountItemsDto): Observable<AccountItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => AccountItemsSerializer)
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findAccount(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Account>): Observable<AccountItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => AccountDataSerializer)
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Delete, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Restore, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Destroy, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Args('data') update: UpdateAccountDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkAccount(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Account>,
    @Args('data') update: UpdateAccountDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
