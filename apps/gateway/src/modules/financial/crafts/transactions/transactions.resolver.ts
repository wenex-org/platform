import { TransactionDataSerializer, TransactionItemsSerializer, TransactionSerializer } from '@app/common/serializers/financial';
import { CreateTransactionDto, CreateTransactionItemsDto, UpdateTransactionDto } from '@app/common/dto/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
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

@Resolver()
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
  countFinancialTransaction(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialTransactions)
  @Validation('financial/transactions', 'create')
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createFinancialTransaction(
    @Meta() meta: Metadata,
    @Args('data') data: CreateTransactionDto,
  ): Observable<TransactionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => TransactionItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialTransactions)
  @Validation('financial/transactions', 'create')
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createFinancialTransactionBulk(
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
  findFinancialTransaction(
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
  findFinancialTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Delete, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteFinancialTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Restore, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreFinancialTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Destroy, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyFinancialTransactionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @Validation('financial/transactions', 'update')
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialTransactionBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateTransactionDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Transaction>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => TransactionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @Validation('financial/transactions', 'update')
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialTransactionById(
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
