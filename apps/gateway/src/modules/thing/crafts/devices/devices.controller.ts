import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { DeviceDataSerializer, DeviceItemsSerializer, DeviceSerializer } from '@app/common/serializers/thing';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { CreateDeviceDto, CreateDeviceItemsDto, UpdateDeviceDto } from '@app/common/dto/thing';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Device as IDevice, DeviceDto } from '@app/common/interfaces/thing';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { ThingProvider } from '@app/common/providers/thing';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('devices', 'thing');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('thing', 'devices')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class DevicesController extends ControllerClass<IDevice, DeviceDto> implements IController<IDevice, DeviceDto> {
  constructor(readonly provider: ThingProvider) {
    super(provider.devices, DeviceSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingDevices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ThingDevices)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/devices', 'create')
  @ApiResponse({ type: DeviceDataSerializer })
  @SetPolicy(Action.Create, Resource.ThingDevices)
  override create(@Meta() meta: Metadata, @Body() data: CreateDeviceDto): Observable<DeviceDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/devices', 'create')
  @ApiResponse({ type: DeviceItemsSerializer })
  @SetPolicy(Action.Create, Resource.ThingDevices)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateDeviceItemsDto): Observable<DeviceItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingDevices)
  @SetPolicy(Action.Read, Resource.ThingDevices)
  @ApiResponse({ type: DeviceItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDevice>): Observable<DeviceItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadThingDevices)
  @SetPolicy(Action.Read, Resource.ThingDevices)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: DeviceSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<IDevice>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super
      .cursor(meta, filter)
      .pipe(switchMap((value) => perm.filter(value)))
      .subscribe({
        next: (data) => res.write(getSseMessage({ id: data.id, data })),
        error: (data) => res.end(getSseMessage({ event: 'error', data })),
        complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
      });
  }

  @Get(':id')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingDevices)
  @ApiResponse({ type: DeviceDataSerializer })
  @SetPolicy(Action.Read, Resource.ThingDevices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<IDevice>): Observable<DeviceDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @ApiResponse({ type: DeviceDataSerializer })
  @SetPolicy(Action.Delete, Resource.ThingDevices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDevice>): Observable<DeviceDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @ApiResponse({ type: DeviceDataSerializer })
  @SetPolicy(Action.Restore, Resource.ThingDevices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDevice>): Observable<DeviceDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingDevices)
  @ApiResponse({ type: DeviceDataSerializer })
  @SetPolicy(Action.Destroy, Resource.ThingDevices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDevice>): Observable<DeviceDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingDevices)
  @Validation('thing/devices', 'update')
  @SetPolicy(Action.Update, Resource.ThingDevices)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<IDevice>,
    @Body() update: UpdateDeviceDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingDevices)
  @Validation('thing/devices', 'update')
  @ApiResponse({ type: DeviceDataSerializer })
  @SetPolicy(Action.Update, Resource.ThingDevices)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<IDevice>,
    @Body() update: UpdateDeviceDto,
  ): Observable<DeviceDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
