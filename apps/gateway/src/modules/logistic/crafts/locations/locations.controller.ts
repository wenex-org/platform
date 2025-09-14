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
import {
  LocationDataSerializer,
  LocationItemsSerializer,
  LocationSerializer,
  NominatimPlaceDataSerializer,
  NominatimPlaceItemsSerializer,
  NominatimPlaceSerializer,
} from '@app/common/serializers/logistic';
import {
  AddressLookupDto,
  CreateLocationDto,
  CreateLocationItemsDto,
  GeocodeLookupDto,
  UpdateLocationDto,
} from '@app/common/dto/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Location, LocationDto } from '@app/common/interfaces/logistic';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { LogisticProvider } from '@app/common/providers/logistic';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('locations', 'logistic');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@ApiTags('logistic', 'locations')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class LocationsController extends ControllerClass<Location, LocationDto> implements IController<Location, LocationDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.locations, LocationSerializer);
  }

  @Post('address-lookup')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ResolveLogisticLocations)
  @SetPolicy(Action.Resolve, Resource.LogisticLocations)
  addressLookup(@Meta() meta: Metadata, @Body() data: AddressLookupDto): Observable<NominatimPlaceDataSerializer> {
    return from(this.provider.locations.addressLookup(data, { meta })).pipe(mapToInstance(NominatimPlaceSerializer, 'data'));
  }

  @Post('geocode-lookup')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ResolveLogisticLocations)
  @SetPolicy(Action.Resolve, Resource.LogisticLocations)
  geocodeLookup(@Meta() meta: Metadata, @Body() data: GeocodeLookupDto): Observable<NominatimPlaceItemsSerializer> {
    return from(this.provider.locations.geocodeLookup(data, { meta })).pipe(mapToInstance(NominatimPlaceSerializer, 'items'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteLogisticLocations)
  @Validation('logistic/locations', 'create')
  @ApiResponse({ type: LocationDataSerializer })
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  override create(@Meta() meta: Metadata, @Body() data: CreateLocationDto): Observable<LocationDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteLogisticLocations)
  @Validation('logistic/locations', 'create')
  @ApiResponse({ type: LocationItemsSerializer })
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateLocationItemsDto): Observable<LocationItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiResponse({ type: LocationItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Location>): Observable<LocationItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: LocationSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Location>) {
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
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @ApiResponse({ type: LocationDataSerializer })
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Location>): Observable<LocationDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @ApiResponse({ type: LocationDataSerializer })
  @SetPolicy(Action.Delete, Resource.LogisticLocations)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Location>): Observable<LocationDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @ApiResponse({ type: LocationDataSerializer })
  @SetPolicy(Action.Restore, Resource.LogisticLocations)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Location>): Observable<LocationDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @ApiResponse({ type: LocationDataSerializer })
  @SetPolicy(Action.Destroy, Resource.LogisticLocations)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Location>): Observable<LocationDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @Validation('logistic/locations', 'update')
  @ApiQuery({ type: QueryFilterDto, required: false })
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Location>,
    @Body() update: UpdateLocationDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @Validation('logistic/locations', 'update')
  @ApiResponse({ type: LocationDataSerializer })
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Body() update: UpdateLocationDto,
  ): Observable<LocationDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
