import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
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
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { getMessageEvent, refineFilterQuery } from '@app/common/utils';
import { Controller as ControllerClass } from '@app/common/classes';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { LogisticProvider } from '@app/common/providers';
import { ClientSession } from 'mongoose';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('locations')
@Controller('locations')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class LocationsController
  extends ControllerClass<Location, LocationDto>
  implements ControllerInterface<Location, LocationDto>
{
  constructor(readonly provider: LogisticProvider) {
    super(provider.locations, () => LocationSerializer);
  }

  @Get('count')
  @Cache('locations', 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('locations', 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateLocationDto,
    @Session() session?: ClientSession,
  ): Observable<LocationDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('locations', 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticLocations)
  createBulk(
    @Meta() meta: Metadata,
    @Body() data: CreateLocationItemsDto,
    @Session() session?: ClientSession,
  ): Observable<LocationItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Get()
  @Cache('locations', 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Session() session?: ClientSession,
  ): Observable<LocationItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: LocationSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Location>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getMessageEvent({ id: data.id, data })),
      error: (data) => res.end(getMessageEvent({ event: 'error', data })),
      complete: () => res.end(getMessageEvent({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache('locations', 'fill')
  @SetScope(Scope.ReadLogisticLocations)
  @SetPolicy(Action.Read, Resource.LogisticLocations)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('locations', 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Delete, Resource.LogisticLocations)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('locations', 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Restore, Resource.LogisticLocations)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('locations', 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @SetPolicy(Action.Destroy, Resource.LogisticLocations)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Location>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('locations', 'flush')
  @SetScope(Scope.WriteLogisticLocations)
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Location>,
    @Body() update: UpdateLocationDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<LocationDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('locations', 'flush')
  @SetScope(Scope.ManageLogisticLocations)
  @SetPolicy(Action.Update, Resource.LogisticLocations)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Location>,
    @Body() update: UpdateLocationDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
