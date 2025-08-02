import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  CreateTransactionDto,
  CreateTransactionItemsDto,
  InitTransactionDto,
  UpdateTransactionDto,
} from '@app/common/dto/financial';
import { TransactionDataSerializer, TransactionItemsSerializer, TransactionSerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Cache, Nested, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Transaction, TransactionDto } from '@app/common/interfaces/financial';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { FinancialProvider } from '@app/common/providers/financial';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('transactions', 'financial');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@ApiTags('financial', 'transactions')
@Nested<Transaction>('payees', 'payers')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TransactionsController
  extends ControllerClass<Transaction, TransactionDto>
  implements IController<Transaction, TransactionDto>
{
  constructor(readonly provider: FinancialProvider) {
    super(provider.transactions, TransactionSerializer);
  }

  @Post('init')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.InitFinancialTransaction)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Init, Resource.FinancialTransactions)
  init(@Meta() meta: Metadata, @Body() data: InitTransactionDto): Observable<TransactionDataSerializer> {
    return from(this.provider.transactions.init(data, { meta })).pipe(mapToInstance(TransactionSerializer, 'data'));
  }

  @Get(':id/abort')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.AbortFinancialTransaction)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Abort, Resource.FinancialTransactions)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  abort(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Transaction>): Observable<TransactionDataSerializer> {
    return from(this.provider.transactions.abort(filter, { meta })).pipe(mapToInstance(TransactionSerializer, 'data'));
  }

  @Get(':id/verify')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.VerifyFinancialTransaction)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Verify, Resource.FinancialTransactions)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  verify(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Transaction>): Observable<TransactionDataSerializer> {
    return from(this.provider.transactions.verify(filter, { meta })).pipe(mapToInstance(TransactionSerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialTransactions)
  @Validation('financial/transactions', 'create')
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  override create(@Meta() meta: Metadata, @Body() data: CreateTransactionDto): Observable<TransactionDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialTransactions)
  @Validation('financial/transactions', 'create')
  @ApiResponse({ type: TransactionItemsSerializer })
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateTransactionItemsDto): Observable<TransactionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiResponse({ type: TransactionItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Transaction>): Observable<TransactionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: TransactionSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Transaction>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super
      .cursor(meta, filter)
      .pipe(switchMap((value) => perm.filter(value)))
      .subscribe({
        next: (data) => res.write(getSseMessage({ id: data.id, data })),
        error: (data) => res.end(getSseMessage({ event: 'error', data })),
        complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
      });
  }

  @Get(':id')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Transaction>): Observable<TransactionDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Delete, Resource.FinancialTransactions)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Transaction>): Observable<TransactionDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Restore, Resource.FinancialTransactions)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Transaction>): Observable<TransactionDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Destroy, Resource.FinancialTransactions)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Transaction>): Observable<TransactionDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @Validation('financial/transactions', 'update')
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Transaction>,
    @Body() update: UpdateTransactionDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @Validation('financial/transactions', 'update')
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Body() update: UpdateTransactionDto,
  ): Observable<TransactionDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
