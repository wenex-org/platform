import { ServiceDataSerializer, ServiceItemsSerializer, ServiceSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateServiceDto, CreateServiceItemsDto, UpdateServiceDto } from '@app/common/dto/career';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Service, ServiceDto } from '@app/common/interfaces/career';
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

const COLL_PATH = COLLECTION('services', 'career');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ServicesResolver extends ControllerClass<Service, ServiceDto> implements IController<Service, ServiceDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.services, ServiceSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerServices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerServices)
  countCareerService(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ServiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerServices)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/services', 'create')
  @SetPolicy(Action.Create, Resource.CareerServices)
  createCareerService(@Meta() meta: Metadata, @Args('data') data: CreateServiceDto): Observable<ServiceDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ServiceItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerServices)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/services', 'create')
  @SetPolicy(Action.Create, Resource.CareerServices)
  createCareerServiceBulk(@Meta() meta: Metadata, @Args('data') data: CreateServiceItemsDto): Observable<ServiceItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ServiceItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerServices)
  @SetPolicy(Action.Read, Resource.CareerServices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerService(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Service>,
  ): Observable<ServiceItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ServiceDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerServices)
  @SetPolicy(Action.Read, Resource.CareerServices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerServiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Service>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ServiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ServiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerServices)
  @SetPolicy(Action.Delete, Resource.CareerServices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerServiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Service>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ServiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ServiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerServices)
  @SetPolicy(Action.Restore, Resource.CareerServices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerServiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Service>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ServiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ServiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerServices)
  @SetPolicy(Action.Destroy, Resource.CareerServices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerServiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Service>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ServiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerServices)
  @Validation('career/services', 'update')
  @SetPolicy(Action.Update, Resource.CareerServices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerServiceBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateServiceDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Service>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ServiceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerServices)
  @Validation('career/services', 'update')
  @SetPolicy(Action.Update, Resource.CareerServices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerServiceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Service>,
    @Args('data') update: UpdateServiceDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ServiceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
