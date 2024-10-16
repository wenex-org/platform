import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
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
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FinancialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@ApiTags(Collection.Transactions)
@Controller(Collection.Transactions)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TransactionsController
  extends ControllerClass<Transaction, TransactionDto>
  implements ControllerInterface<Transaction, TransactionDto>
{
  constructor(readonly provider: FinancialProvider) {
    super(provider.transactions, () => TransactionSerializer);
  }

  @Get('count')
  @Cache(Collection.Transactions, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  create(@Meta() meta: Metadata, @Body() data: CreateTransactionDto): Observable<TransactionDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateTransactionItemsDto): Observable<TransactionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Transactions, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Transaction>): Observable<TransactionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<Transaction>): Observable<TransactionSerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @Cache(Collection.Transactions, 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Delete, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Restore, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Destroy, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Body() update: UpdateTransactionDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Transactions, 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Transaction>,
    @Body() update: UpdateTransactionDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
