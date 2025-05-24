import { LocationDataSerializer, LocationItemsSerializer, LocationSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateLocationDto, CreateLocationItemsDto, UpdateLocationDto } from '@app/common/dto/logistic';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Location, LocationDto } from '@app/common/interfaces/logistic';
import { Action, Collection, Resource, Scope } from '@app/common/core';
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

@Resolver(() => LocationSerializer)
@RateLimit('locations')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class LocationsResolver extends ControllerClass<Location, LocationDto> implements IController<Location, LocationDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.locations, LocationSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Locations, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  countLocation(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  createLocation(@Meta() meta: Metadata, @Args('data') data: CreateLocationDto): Observable<LocationDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => LocationItemsSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  createLocationBulk(@Meta() meta: Metadata, @Args('data') data: CreateLocationItemsDto): Observable<LocationItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => LocationItemsSerializer)
  @Cache(Collection.Locations, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLocation(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Location>): Observable<LocationItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Delete, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Restore, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @SetPolicy(Action.Destroy, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyLocationById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLocationBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateLocationDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Location>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLocationById(
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
