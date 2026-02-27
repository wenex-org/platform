import { InvoiceDataSerializer, InvoiceItemsSerializer, InvoiceSerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateInvoiceDto, CreateInvoiceItemsDto, UpdateInvoiceDto } from '@app/common/dto/financial';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
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

const COLL_PATH = COLLECTION('invoices', 'financial');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class InvoicesResolver extends ControllerClass<Invoice, InvoiceDto> implements IController<Invoice, InvoiceDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.invoices, InvoiceSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  countFinancialInvoice(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialInvoices)
  @Validation('financial/invoices', 'create')
  @SetPolicy(Action.Create, Resource.FinancialInvoices)
  createFinancialInvoice(@Meta() meta: Metadata, @Args('data') data: CreateInvoiceDto): Observable<InvoiceDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => InvoiceItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialInvoices)
  @Validation('financial/invoices', 'create')
  @SetPolicy(Action.Create, Resource.FinancialInvoices)
  createFinancialInvoiceBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateInvoiceItemsDto,
  ): Observable<InvoiceItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => InvoiceItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findFinancialInvoice(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Invoice>,
  ): Observable<InvoiceItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => InvoiceDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialInvoices)
  @SetPolicy(Action.Read, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findFinancialInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @SetPolicy(Action.Delete, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteFinancialInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @SetPolicy(Action.Restore, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreFinancialInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialInvoices)
  @SetPolicy(Action.Destroy, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyFinancialInvoiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Invoice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<InvoiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialInvoices)
  @Validation('financial/invoices', 'update')
  @SetPolicy(Action.Update, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialInvoiceBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateInvoiceDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Invoice>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => InvoiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialInvoices)
  @Validation('financial/invoices', 'update')
  @SetPolicy(Action.Update, Resource.FinancialInvoices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFinancialInvoiceById(
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
