import { AccountDataSerializer, AccountItemsSerializer, AccountSerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateAccountDto, CreateAccountItemsDto, UpdateAccountDto } from '@app/common/dto/financial';
import { Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Account, AccountDto } from '@app/common/interfaces/financial';
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

const COLL_PATH = COLLECTION('accounts', 'financial');

@Resolver(() => AccountSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AccountsResolver extends ControllerClass<Account, AccountDto> implements IController<Account, AccountDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.accounts, AccountSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  countFinancialAccount(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialAccounts)
  @Validation('financial/accounts', 'create')
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createFinancialAccount(@Meta() meta: Metadata, @Args('data') data: CreateAccountDto): Observable<AccountDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => AccountItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialAccounts)
  @Validation('financial/accounts', 'create')
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createFinancialAccountBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateAccountItemsDto,
  ): Observable<AccountItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => AccountItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findFinancialAccount(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Account>,
  ): Observable<AccountItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => AccountDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findFinancialAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Delete, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteFinancialAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Restore, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreFinancialAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Destroy, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyFinancialAccountById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @Validation('financial/accounts', 'update')
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialAccountBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateAccountDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Account>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @Validation('financial/accounts', 'update')
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialAccountById(
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
