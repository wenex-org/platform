import { DriverDataSerializer, DriverItemsSerializer, DriverSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateDriverDto, CreateDriverItemsDto, UpdateDriverDto } from '@app/common/dto/logistic';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Driver, DriverDto } from '@app/common/interfaces/logistic';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { LogisticProvider } from '@app/common/providers/logistic';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('drivers', 'logistic');

@Resolver(() => DriverSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class DriversResolver extends ControllerClass<Driver, DriverDto> implements IController<Driver, DriverDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.drivers, DriverSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  countDriver(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  createDriver(@Meta() meta: Metadata, @Args('data') data: CreateDriverDto): Observable<DriverDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => DriverItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  createDriverBulk(@Meta() meta: Metadata, @Args('data') data: CreateDriverItemsDto): Observable<DriverItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => DriverItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findDriver(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Driver>): Observable<DriverItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => DriverDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findDriverById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Driver>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Delete, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteDriverById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Restore, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreDriverById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @SetPolicy(Action.Destroy, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyDriverById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateDriverBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateDriverDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Driver>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateDriverById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Driver>,
    @Args('data') update: UpdateDriverDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
