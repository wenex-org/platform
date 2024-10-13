import {
  CreateVehicleDto,
  CreateVehicleItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateVehicleDto,
} from '@app/common/dto';
import { TotalSerializer, VehicleDataSerializer, VehicleItemsSerializer, VehicleSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Vehicle, VehicleDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { LogisticProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => VehicleSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class VehiclesResolver extends ControllerClass<Vehicle, VehicleDto> implements ControllerInterface<Vehicle, VehicleDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.vehicles, () => VehicleSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('vehicles', 'fill')
  @SetScope(Scope.ReadLogisticVehicles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticVehicles)
  countVehicle(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @ShipStrategy('create')
  @Cache('vehicles', 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticVehicles)
  createVehicle(@Meta() meta: Metadata, @Args('data') data: CreateVehicleDto): Observable<VehicleDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => VehicleItemsSerializer)
  @ShipStrategy('create')
  @Cache('vehicles', 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticVehicles)
  createBulkVehicle(@Meta() meta: Metadata, @Args('data') data: CreateVehicleItemsDto): Observable<VehicleItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => VehicleItemsSerializer)
  @Cache('vehicles', 'fill')
  @SetScope(Scope.ReadLogisticVehicles)
  @SetPolicy(Action.Read, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findVehicle(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Vehicle>): Observable<VehicleItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => VehicleDataSerializer)
  @Cache('vehicles', 'fill')
  @SetScope(Scope.ReadLogisticVehicles)
  @SetPolicy(Action.Read, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneVehicle(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Vehicle>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache('vehicles', 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @SetPolicy(Action.Delete, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneVehicle(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Vehicle>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache('vehicles', 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @SetPolicy(Action.Restore, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneVehicle(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Vehicle>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache('vehicles', 'flush')
  @SetScope(Scope.ManageLogisticVehicles)
  @SetPolicy(Action.Destroy, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneVehicle(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Vehicle>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @ShipStrategy('update')
  @Cache('vehicles', 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @SetPolicy(Action.Update, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneVehicle(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Vehicle>,
    @Args('data') update: UpdateVehicleDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('vehicles', 'flush')
  @SetScope(Scope.ManageLogisticVehicles)
  @SetPolicy(Action.Update, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkVehicle(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Vehicle>,
    @Args('data') update: UpdateVehicleDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
