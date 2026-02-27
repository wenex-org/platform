import { LocationDataSerializer, LocationItemsSerializer, LocationSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateLocationDto, CreateLocationItemsDto, UpdateLocationDto } from '@app/common/dto/logistic';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Location, LocationDto } from '@app/common/interfaces/logistic';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
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

const COLL_PATH = COLLECTION('locations', 'logistic');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class LocationsResolver extends ControllerClass<Location, LocationDto> implements IController<Location, LocationDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.locations, LocationSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  countLogisticLocation(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteLogisticLocations)
  @Validation('logistic/locations', 'create')
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  createLogisticLocation(@Meta() meta: Metadata, @Args('data') data: CreateLocationDto): Observable<LocationDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => LocationItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteLogisticLocations)
  @Validation('logistic/locations', 'create')
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  createLogisticLocationBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateLocationItemsDto,
  ): Observable<LocationItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => LocationItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLogisticLocation(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Location>,
  ): Observable<LocationItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => LocationDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLogisticLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Delete, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteLogisticLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Restore, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreLogisticLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @SetPolicy(Action.Destroy, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyLogisticLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @Validation('logistic/locations', 'update')
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLogisticLocationBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateLocationDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Location>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => LocationDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @Validation('logistic/locations', 'update')
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLogisticLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Args('data') update: UpdateLocationDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
