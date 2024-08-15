import {
  TotalSerializer,
  TransactionDataSerializer,
  TransactionItemsSerializer,
  TransactionSerializer,
} from '@app/common/serializers';
import {
  CreateTransactionDto,
  CreateTransactionItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateTransactionDto,
} from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Transaction, TransactionDto } from '@app/common/interfaces';
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

@Resolver(() => TransactionSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TransactionsResolver
  extends ControllerClass<Transaction, TransactionDto>
  implements ControllerInterface<Transaction, TransactionDto>
{
  constructor(readonly provider: FinancialProvider) {
    super(provider.transactions, () => TransactionSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('transactions', 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  countTransaction(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => TransactionDataSerializer)
  @ShipStrategy('create')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createTransaction(
    @Meta() meta: Metadata,
    @Args('data') data: CreateTransactionDto,
    @Session() session?: ClientSession,
  ): Observable<TransactionDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => TransactionItemsSerializer)
  @ShipStrategy('create')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createBulkTransaction(
    @Meta() meta: Metadata,
    @Args() data: CreateTransactionItemsDto,
    @Session() session?: ClientSession,
  ): Observable<TransactionItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Query(() => TransactionItemsSerializer)
  @Cache('transactions', 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findTransaction(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
  ): Observable<TransactionItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => TransactionDataSerializer)
  @Cache('transactions', 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Delete, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Restore, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache('transactions', 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Destroy, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => TransactionDataSerializer)
  @ShipStrategy('update')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Args('data') update: UpdateTransactionDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('transactions', 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkTransaction(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Transaction>,
    @Args('data') update: UpdateTransactionDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
