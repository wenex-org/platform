import {
  CreateLocationDto,
  CreateLocationItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateLocationDto,
} from '@app/common/dto';
import { TotalSerializer, LocationDataSerializer, LocationItemsSerializer, LocationSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Location, LocationDto } from '@app/common/interfaces';
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

@Resolver(() => LocationSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class LocationsResolver
  extends ControllerClass<Location, LocationDto>
  implements ControllerInterface<Location, LocationDto>
{
  constructor(readonly provider: LogisticProvider) {
    super(provider.locations, () => LocationSerializer);
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
  @ShipStrategy('create')
  @Cache(Collection.Locations, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  createLocation(@Meta() meta: Metadata, @Args('data') data: CreateLocationDto): Observable<LocationDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => LocationItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Locations, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  createBulkLocation(@Meta() meta: Metadata, @Args('data') data: CreateLocationItemsDto): Observable<LocationItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => LocationItemsSerializer)
  @Cache(Collection.Locations, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findLocation(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Location>): Observable<LocationItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneLocation(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Delete, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneLocation(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Restore, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneLocation(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @SetPolicy(Action.Destroy, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneLocation(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => LocationDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneLocation(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Args('data') update: UpdateLocationDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Locations, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkLocation(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Location>,
    @Args('data') update: UpdateLocationDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
