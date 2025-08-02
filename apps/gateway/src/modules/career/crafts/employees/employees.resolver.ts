import { EmployeeDataSerializer, EmployeeItemsSerializer, EmployeeSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateEmployeeDto, CreateEmployeeItemsDto, UpdateEmployeeDto } from '@app/common/dto/career';
import { Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Employee, EmployeeDto } from '@app/common/interfaces/career';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { CareerProvider } from '@app/common/providers/career';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('employees', 'career');

@Resolver(() => EmployeeSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class EmployeesResolver extends ControllerClass<Employee, EmployeeDto> implements IController<Employee, EmployeeDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.employees, EmployeeSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerEmployees)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerEmployees)
  countCareerEmployee(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => EmployeeDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerEmployees)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/employees', 'create')
  @SetPolicy(Action.Create, Resource.CareerEmployees)
  createCareerEmployee(@Meta() meta: Metadata, @Args('data') data: CreateEmployeeDto): Observable<EmployeeDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => EmployeeItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerEmployees)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/employees', 'create')
  @SetPolicy(Action.Create, Resource.CareerEmployees)
  createCareerEmployeeBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateEmployeeItemsDto,
  ): Observable<EmployeeItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => EmployeeItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerEmployees)
  @SetPolicy(Action.Read, Resource.CareerEmployees)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerEmployee(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Employee>,
  ): Observable<EmployeeItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => EmployeeDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerEmployees)
  @SetPolicy(Action.Read, Resource.CareerEmployees)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerEmployeeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Employee>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmployeeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => EmployeeDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerEmployees)
  @SetPolicy(Action.Delete, Resource.CareerEmployees)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerEmployeeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Employee>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmployeeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => EmployeeDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerEmployees)
  @SetPolicy(Action.Restore, Resource.CareerEmployees)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerEmployeeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Employee>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmployeeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => EmployeeDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerEmployees)
  @SetPolicy(Action.Destroy, Resource.CareerEmployees)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerEmployeeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Employee>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmployeeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerEmployees)
  @Validation('career/employees', 'update')
  @SetPolicy(Action.Update, Resource.CareerEmployees)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerEmployeeBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateEmployeeDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Employee>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => EmployeeDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerEmployees)
  @Validation('career/employees', 'update')
  @SetPolicy(Action.Update, Resource.CareerEmployees)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerEmployeeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Employee>,
    @Args('data') update: UpdateEmployeeDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmployeeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
