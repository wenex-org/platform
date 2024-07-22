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
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { CreateTransactionDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateTransactionDto } from '@app/common/dto';
import { Controller as ControllerInterface, Metadata, Transaction, TransactionDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FinancialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('transactions')
@Controller('transactions')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
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
  @Cache('transactions', 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateTransactionDto,
    @Session() session?: ClientSession,
  ): Observable<TransactionDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @ApiBody({ type: [CreateTransactionDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialTransactions)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateTransactionDto[],
    @Session() session?: ClientSession,
  ): Observable<TransactionItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('transactions', 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
  ): Observable<TransactionItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
  ): Observable<TransactionSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('transactions', 'fill')
  @SetScope(Scope.ReadFinancialTransactions)
  @SetPolicy(Action.Read, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Delete, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Restore, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('transactions', 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Destroy, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Transaction>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('transactions', 'flush')
  @SetScope(Scope.WriteFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Transaction>,
    @Body() update: UpdateTransactionDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TransactionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('transactions', 'flush')
  @SetScope(Scope.ManageFinancialTransactions)
  @SetPolicy(Action.Update, Resource.FinancialTransactions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Transaction>,
    @Body() update: UpdateTransactionDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
