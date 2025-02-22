import { InvoiceDataSerializer, InvoiceItemsSerializer, InvoiceSerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateInvoiceDto, CreateInvoiceItemsDto, UpdateInvoiceDto } from '@app/common/dto/financial';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Invoice, InvoiceDto } from '@app/common/interfaces/financial';
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

@Resolver(() => InvoiceSerializer)
@RateLimit('invoices')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class InvoicesResolver extends ControllerClass<Invoice, InvoiceDto> implements IController<Invoice, InvoiceDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.invoices, InvoiceSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Invoices, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  countInvoice(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialInvoices)
  createInvoice(@Meta() meta: Metadata, @Args('data') data: CreateInvoiceDto): Observable<InvoiceDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => InvoiceItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialInvoices)
  createInvoiceBulk(@Meta() meta: Metadata, @Args('data') data: CreateInvoiceItemsDto): Observable<InvoiceItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => InvoiceItemsSerializer)
  @Cache(Collection.Invoices, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findInvoice(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Invoice>): Observable<InvoiceItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => InvoiceDataSerializer)
  @Cache(Collection.Invoices, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @SetPolicy(Action.Delete, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @SetPolicy(Action.Restore, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.ManageFinancialInvoices)
  @SetPolicy(Action.Destroy, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.ManageFinancialInvoices)
  @SetPolicy(Action.Update, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateInvoiceBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateInvoiceDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Invoice>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => InvoiceDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Invoices, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @SetPolicy(Action.Update, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Invoice>,
    @Args('data') update: UpdateInvoiceDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
