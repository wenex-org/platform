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
import { DriverDataSerializer, DriverItemsSerializer, DriverSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateDriverDto, CreateDriverItemsDto, UpdateDriverDto } from '@app/common/dto/logistic';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Driver as IDriver, DriverDto } from '@app/common/interfaces/logistic';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { LogisticProvider } from '@app/common/providers/logistic';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

@ApiBearerAuth()
@RateLimit('drivers')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Drivers)
@Controller(Collection.Drivers)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class DriversController extends ControllerClass<IDriver, DriverDto> implements IController<IDriver, DriverDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.drivers, DriverSerializer);
  }

  @Get('count')
  @Cache(Collection.Drivers, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: DriverDataSerializer })
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  override create(@Meta() meta: Metadata, @Body() data: CreateDriverDto): Observable<DriverDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: DriverItemsSerializer })
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateDriverItemsDto): Observable<DriverItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Drivers, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiResponse({ type: DriverItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDriver>): Observable<DriverItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: DriverSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<IDriver>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Logistic-Type', 'text/event-stream');
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
  @Cache(Collection.Drivers, 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @ApiResponse({ type: DriverDataSerializer })
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<IDriver>): Observable<DriverDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @ApiResponse({ type: DriverDataSerializer })
  @SetPolicy(Action.Delete, Resource.LogisticDrivers)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDriver>): Observable<DriverDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @ApiResponse({ type: DriverDataSerializer })
  @SetPolicy(Action.Restore, Resource.LogisticDrivers)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDriver>): Observable<DriverDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @ApiResponse({ type: DriverDataSerializer })
  @SetPolicy(Action.Destroy, Resource.LogisticDrivers)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<IDriver>): Observable<DriverDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<IDriver>,
    @Body() update: UpdateDriverDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(Collection.Drivers, 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @ApiResponse({ type: DriverDataSerializer })
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<IDriver>,
    @Body() update: UpdateDriverDto,
  ): Observable<DriverDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
