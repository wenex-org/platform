import { DeviceDataSerializer, DeviceItemsSerializer, DeviceSerializer } from '@app/common/serializers/thing';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateDeviceDto, CreateDeviceItemsDto, UpdateDeviceDto } from '@app/common/dto/thing';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Device, DeviceDto } from '@app/common/interfaces/thing';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { ThingProvider } from '@app/common/providers/thing';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('devices', 'thing');

@Resolver(() => DeviceSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class DevicesResolver extends ControllerClass<Device, DeviceDto> implements IController<Device, DeviceDto> {
  constructor(readonly provider: ThingProvider) {
    super(provider.devices, DeviceSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingDevices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ThingDevices)
  countThingDevice(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => DeviceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/devices', 'create')
  @SetPolicy(Action.Create, Resource.ThingDevices)
  createThingDevice(@Meta() meta: Metadata, @Args('data') data: CreateDeviceDto): Observable<DeviceDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => DeviceItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/devices', 'create')
  @SetPolicy(Action.Create, Resource.ThingDevices)
  createThingDeviceBulk(@Meta() meta: Metadata, @Args('data') data: CreateDeviceItemsDto): Observable<DeviceItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => DeviceItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingDevices)
  @SetPolicy(Action.Read, Resource.ThingDevices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findThingDevice(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Device>): Observable<DeviceItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => DeviceDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingDevices)
  @SetPolicy(Action.Read, Resource.ThingDevices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findThingDeviceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Device>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DeviceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => DeviceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @SetPolicy(Action.Delete, Resource.ThingDevices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteThingDeviceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Device>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DeviceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => DeviceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @SetPolicy(Action.Restore, Resource.ThingDevices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreThingDeviceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Device>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DeviceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => DeviceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingDevices)
  @SetPolicy(Action.Destroy, Resource.ThingDevices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyThingDeviceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Device>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DeviceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingDevices)
  @Validation('thing/devices', 'update')
  @SetPolicy(Action.Update, Resource.ThingDevices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateThingDeviceBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateDeviceDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Device>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => DeviceDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @Validation('thing/devices', 'update')
  @SetPolicy(Action.Update, Resource.ThingDevices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateThingDeviceById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Device>,
    @Args('data') update: UpdateDeviceDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<DeviceDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
