import { TransactionDataSerializer, TransactionItemsSerializer, TransactionSerializer } from '@app/common/serializers/financial';
import { CreateTransactionDto, CreateTransactionItemsDto, UpdateTransactionDto } from '@app/common/dto/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Transaction, TransactionDto } from '@app/common/interfaces/financial';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
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

const COLL_PATH = COLLECTION('transactions', 'financial');

@Resolver(() => TransactionSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TransactionsResolver
  extends ControllerClass<Transaction, TransactionDto>
  implements IController<Transaction, TransactionDto>
{
  constructor(readonly provider: FinancialProvider) {
    super(provider.transactions, TransactionSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  countTransaction(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createTransaction(@Meta() meta: Metadata, @Args('data') data: CreateTransactionDto): Observable<TransactionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => TransactionItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createTransactionBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateTransactionItemsDto,
  ): Observable<TransactionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => TransactionItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTransaction(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Transaction>,
  ): Observable<TransactionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => TransactionDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Delete, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Restore, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Destroy, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTransactionBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateTransactionDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Transaction>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Args('data') update: UpdateTransactionDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
