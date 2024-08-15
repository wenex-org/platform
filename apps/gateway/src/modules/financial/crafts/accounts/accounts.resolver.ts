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
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FinancialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
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
  @Cache('accounts', 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  countAccount(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => AccountDataSerializer)
  @ShipStrategy('create')
  @Cache('accounts', 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createAccount(
    @Meta() meta: Metadata,
    @Args('data') data: CreateAccountDto,
    @Session() session?: ClientSession,
  ): Observable<AccountDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => AccountItemsSerializer)
  @ShipStrategy('create')
  @Cache('accounts', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createBulkAccount(
    @Meta() meta: Metadata,
    @Args('data') data: CreateAccountItemsDto,
    @Session() session?: ClientSession,
  ): Observable<AccountItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Query(() => AccountItemsSerializer)
  @Cache('accounts', 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findAccount(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Account>,
    @Session() session?: ClientSession,
  ): Observable<AccountItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => AccountDataSerializer)
  @Cache('accounts', 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache('accounts', 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Delete, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache('accounts', 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Restore, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => AccountDataSerializer)
  @Cache('accounts', 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Destroy, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => AccountDataSerializer)
  @ShipStrategy('update')
  @Cache('accounts', 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneAccount(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Args('data') update: UpdateAccountDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('accounts', 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkAccount(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Account>,
    @Args('data') update: UpdateAccountDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
