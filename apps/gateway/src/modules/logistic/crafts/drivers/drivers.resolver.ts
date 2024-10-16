import { CreateDriverDto, CreateDriverItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateDriverDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, DriverDataSerializer, DriverItemsSerializer, DriverSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Driver, DriverDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { LogisticProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => DriverSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class DriversResolver extends ControllerClass<Driver, DriverDto> implements ControllerInterface<Driver, DriverDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.drivers, () => DriverSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Drivers, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  countDriver(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  createDriver(@Meta() meta: Metadata, @Args('data') data: CreateDriverDto): Observable<DriverDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => DriverItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  createBulkDriver(@Meta() meta: Metadata, @Args('data') data: CreateDriverItemsDto): Observable<DriverItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => DriverItemsSerializer)
  @Cache(Collection.Drivers, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findDriver(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Driver>): Observable<DriverItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => DriverDataSerializer)
  @Cache(Collection.Drivers, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneDriver(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Driver>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Delete, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneDriver(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Restore, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneDriver(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @SetPolicy(Action.Destroy, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneDriver(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => DriverDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneDriver(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Driver>,
    @Args('data') update: UpdateDriverDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkDriver(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Driver>,
    @Args('data') update: UpdateDriverDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
