import { CustomerDataSerializer, CustomerItemsSerializer, CustomerSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateCustomerDto, CreateCustomerItemsDto, UpdateCustomerDto } from '@app/common/dto/career';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Customer, CustomerDto } from '@app/common/interfaces/career';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { CareerProvider } from '@app/common/providers/career';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('customers', 'career');

@Resolver(() => CustomerSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CustomersResolver extends ControllerClass<Customer, CustomerDto> implements IController<Customer, CustomerDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.customers, CustomerSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerCustomers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerCustomers)
  countCareerCustomer(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => CustomerDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerCustomers)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/customers', 'create')
  @SetPolicy(Action.Create, Resource.CareerCustomers)
  createCareerCustomer(@Meta() meta: Metadata, @Args('data') data: CreateCustomerDto): Observable<CustomerDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => CustomerItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerCustomers)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/customers', 'create')
  @SetPolicy(Action.Create, Resource.CareerCustomers)
  createCareerCustomerBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateCustomerItemsDto,
  ): Observable<CustomerItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => CustomerItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerCustomers)
  @SetPolicy(Action.Read, Resource.CareerCustomers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerCustomer(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Customer>,
  ): Observable<CustomerItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => CustomerDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerCustomers)
  @SetPolicy(Action.Read, Resource.CareerCustomers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerCustomerById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Customer>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CustomerDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => CustomerDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerCustomers)
  @SetPolicy(Action.Delete, Resource.CareerCustomers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerCustomerById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Customer>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CustomerDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => CustomerDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerCustomers)
  @SetPolicy(Action.Restore, Resource.CareerCustomers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerCustomerById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Customer>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CustomerDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => CustomerDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerCustomers)
  @SetPolicy(Action.Destroy, Resource.CareerCustomers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerCustomerById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Customer>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CustomerDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerCustomers)
  @Validation('career/customers', 'update')
  @SetPolicy(Action.Update, Resource.CareerCustomers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerCustomerBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateCustomerDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Customer>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => CustomerDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerCustomers)
  @Validation('career/customers', 'update')
  @SetPolicy(Action.Update, Resource.CareerCustomers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerCustomerById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Customer>,
    @Args('data') update: UpdateCustomerDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CustomerDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
