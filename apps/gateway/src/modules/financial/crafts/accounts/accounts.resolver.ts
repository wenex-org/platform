import { AccountDataSerializer, AccountItemsSerializer, AccountSerializer } from '@app/common/serializers/financial';
import { CreateAccountDto, CreateAccountItemsDto, UpdateAccountDto } from '@app/common/dto/financial';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Account, AccountDto } from '@app/common/interfaces/financial';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
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

@Resolver(() => AccountSerializer)
@RateLimit('accounts')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AccountsResolver extends ControllerClass<Account, AccountDto> implements IController<Account, AccountDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.accounts, AccountSerializer);
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
  @SetScope(Scope.WriteFinancialAccounts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createAccountBulk(@Meta() meta: Metadata, @Args('data') data: CreateAccountItemsDto): Observable<AccountItemsSerializer> {
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
  findAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Delete, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Restore, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Destroy, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateAccountBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateAccountDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Account>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => AccountDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Args('data') update: UpdateAccountDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
