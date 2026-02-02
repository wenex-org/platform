import { SensorDataSerializer, SensorItemsSerializer, SensorSerializer } from '@app/common/serializers/thing';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateSensorDto, CreateSensorItemsDto, UpdateSensorDto } from '@app/common/dto/thing';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Sensor, SensorDto } from '@app/common/interfaces/thing';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { ThingProvider } from '@app/common/providers/thing';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('sensors', 'thing');

@Resolver(() => SensorSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SensorsResolver extends ControllerClass<Sensor, SensorDto> implements IController<Sensor, SensorDto> {
  constructor(readonly provider: ThingProvider) {
    super(provider.sensors, SensorSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingSensors)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ThingSensors)
  countThingSensor(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SensorDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingSensors)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/sensors', 'create')
  @SetPolicy(Action.Create, Resource.ThingSensors)
  createThingSensor(@Meta() meta: Metadata, @Args('data') data: CreateSensorDto): Observable<SensorDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SensorItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingSensors)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/sensors', 'create')
  @SetPolicy(Action.Create, Resource.ThingSensors)
  createThingSensorBulk(@Meta() meta: Metadata, @Args('data') data: CreateSensorItemsDto): Observable<SensorItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SensorItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingSensors)
  @SetPolicy(Action.Read, Resource.ThingSensors)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findThingSensor(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Sensor>): Observable<SensorItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SensorDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingSensors)
  @SetPolicy(Action.Read, Resource.ThingSensors)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findThingSensorById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Sensor>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SensorDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SensorDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingSensors)
  @SetPolicy(Action.Delete, Resource.ThingSensors)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteThingSensorById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Sensor>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SensorDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SensorDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingSensors)
  @SetPolicy(Action.Restore, Resource.ThingSensors)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreThingSensorById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Sensor>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SensorDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SensorDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingSensors)
  @SetPolicy(Action.Destroy, Resource.ThingSensors)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyThingSensorById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Sensor>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SensorDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingSensors)
  @Validation('thing/sensors', 'update')
  @SetPolicy(Action.Update, Resource.ThingSensors)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateThingSensorBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSensorDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Sensor>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SensorDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingSensors)
  @Validation('thing/sensors', 'update')
  @SetPolicy(Action.Update, Resource.ThingSensors)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateThingSensorById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Sensor>,
    @Args('data') update: UpdateSensorDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SensorDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
