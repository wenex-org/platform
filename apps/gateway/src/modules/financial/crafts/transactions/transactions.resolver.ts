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
  @UseInterceptors(AuthorityInterceptor)
  @Cache(Collection.Transactions, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  countTransaction(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createTransaction(@Meta() meta: Metadata, @Args('data') data: CreateTransactionDto): Observable<TransactionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => TransactionItemsSerializer)
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createBulkTransaction(
    @Meta() meta: Metadata,
    @Args('data') data: CreateTransactionItemsDto,
  ): Observable<TransactionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => TransactionItemsSerializer)
  @Cache(Collection.Transactions, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findTransaction(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Transaction>,
  ): Observable<TransactionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => TransactionDataSerializer)
  @Cache(Collection.Transactions, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Delete, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Restore, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Destroy, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TransactionDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneTransaction(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Args('data') update: UpdateTransactionDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkTransaction(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Transaction>,
    @Args('data') update: UpdateTransactionDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
