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
  InvoiceDataSerializer,
  InvoiceItemsSerializer,
  InvoiceSerializer,
  TransactionDataSerializer,
  TransactionSerializer,
} from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateInvoiceDto, CreateInvoiceItemsDto, UpdateInvoiceDto } from '@app/common/dto/financial';
import { Cache, Nested, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Invoice, InvoiceDto } from '@app/common/interfaces/financial';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { FinancialProvider } from '@app/common/providers/financial';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

@ApiBearerAuth()
@RateLimit('invoices')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Invoices)
@Controller(Collection.Invoices)
@UseFilters(AllExceptionsFilter)
@Nested<Invoice>('payees', 'payers')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class InvoicesController extends ControllerClass<Invoice, InvoiceDto> implements IController<Invoice, InvoiceDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.invoices, InvoiceSerializer);
  }

  @Get(':id/payment')
  @SetScope(Scope.PaymentFinancialInvoices)
  @ApiResponse({ type: TransactionDataSerializer })
  @SetPolicy(Action.Payment, Resource.FinancialInvoices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  payment(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Invoice>): Observable<TransactionDataSerializer> {
    return from(this.provider.invoices.payment(filter, { meta })).pipe(mapToInstance(TransactionSerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(Collection.Invoices, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: InvoiceDataSerializer })
  @SetPolicy(Action.Create, Resource.FinancialInvoices)
  override create(@Meta() meta: Metadata, @Body() data: CreateInvoiceDto): Observable<InvoiceDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: InvoiceItemsSerializer })
  @SetPolicy(Action.Create, Resource.FinancialInvoices)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateInvoiceItemsDto): Observable<InvoiceItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Invoices, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @ApiResponse({ type: InvoiceItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Invoice>): Observable<InvoiceItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialInvoices)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: InvoiceSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Invoice>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, perm, filter).subscribe({
      next: (data) => res.write(getSseMessage({ id: data.id, data })),
      error: (data) => res.end(getSseMessage({ event: 'error', data })),
      complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache(Collection.Invoices, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @ApiResponse({ type: InvoiceDataSerializer })
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Invoice>): Observable<InvoiceDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @ApiResponse({ type: InvoiceDataSerializer })
  @SetPolicy(Action.Delete, Resource.FinancialInvoices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Invoice>): Observable<InvoiceDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @ApiResponse({ type: InvoiceDataSerializer })
  @SetPolicy(Action.Restore, Resource.FinancialInvoices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Invoice>): Observable<InvoiceDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.ManageFinancialInvoices)
  @ApiResponse({ type: InvoiceDataSerializer })
  @SetPolicy(Action.Destroy, Resource.FinancialInvoices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Invoice>): Observable<InvoiceDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.ManageFinancialInvoices)
  @SetPolicy(Action.Update, Resource.FinancialInvoices)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Invoice>,
    @Body() update: UpdateInvoiceDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @ApiResponse({ type: InvoiceDataSerializer })
  @SetPolicy(Action.Update, Resource.FinancialInvoices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Invoice>,
    @Body() update: UpdateInvoiceDto,
  ): Observable<InvoiceDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
