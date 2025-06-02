import { VehicleDataSerializer, VehicleItemsSerializer, VehicleSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateVehicleDto, CreateVehicleItemsDto, UpdateVehicleDto } from '@app/common/dto/logistic';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Vehicle, VehicleDto } from '@app/common/interfaces/logistic';
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

const COLL_PATH = COLLECTION('vehicles', 'logistic');

@Resolver(() => VehicleSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class VehiclesResolver extends ControllerClass<Vehicle, VehicleDto> implements IController<Vehicle, VehicleDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.vehicles, VehicleSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticVehicles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticVehicles)
  countVehicle(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticVehicles)
  createVehicle(@Meta() meta: Metadata, @Args('data') data: CreateVehicleDto): Observable<VehicleDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => VehicleItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticVehicles)
  createVehicleBulk(@Meta() meta: Metadata, @Args('data') data: CreateVehicleItemsDto): Observable<VehicleItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => VehicleItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticVehicles)
  @SetPolicy(Action.Read, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findVehicle(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Vehicle>): Observable<VehicleItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => VehicleDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticVehicles)
  @SetPolicy(Action.Read, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findVehicleById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Vehicle>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @SetPolicy(Action.Delete, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteVehicleById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Vehicle>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @SetPolicy(Action.Restore, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreVehicleById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Vehicle>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticVehicles)
  @SetPolicy(Action.Destroy, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyVehicleById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Vehicle>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticVehicles)
  @SetPolicy(Action.Update, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateVehicleBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateVehicleDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Vehicle>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => VehicleDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticVehicles)
  @SetPolicy(Action.Update, Resource.LogisticVehicles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateVehicleById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Vehicle>,
    @Args('data') update: UpdateVehicleDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<VehicleDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
