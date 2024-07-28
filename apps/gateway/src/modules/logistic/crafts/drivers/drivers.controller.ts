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
import { TotalSerializer, DriverDataSerializer, DriverItemsSerializer, DriverSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { CreateDriverDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateDriverDto } from '@app/common/dto';
import { Controller as ControllerInterface, Metadata, Driver, DriverDto } from '@app/common/interfaces';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
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
@ApiTags('drivers')
@Controller('drivers')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class DriversController extends ControllerClass<Driver, DriverDto> implements ControllerInterface<Driver, DriverDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.drivers, () => DriverSerializer);
  }

  @Get('count')
  @Cache('drivers', 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('drivers', 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateDriverDto,
    @Session() session?: ClientSession,
  ): Observable<DriverDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('drivers', 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @ApiBody({ type: [CreateDriverDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticDrivers)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateDriverDto[],
    @Session() session?: ClientSession,
  ): Observable<DriverItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('drivers', 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Session() session?: ClientSession,
  ): Observable<DriverItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: DriverSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Driver>) {
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
  @Cache('drivers', 'fill')
  @SetScope(Scope.ReadLogisticDrivers)
  @SetPolicy(Action.Read, Resource.LogisticDrivers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Driver>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('drivers', 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Delete, Resource.LogisticDrivers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('drivers', 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Restore, Resource.LogisticDrivers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('drivers', 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @SetPolicy(Action.Destroy, Resource.LogisticDrivers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Driver>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('drivers', 'flush')
  @SetScope(Scope.WriteLogisticDrivers)
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Driver>,
    @Body() update: UpdateDriverDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<DriverDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('drivers', 'flush')
  @SetScope(Scope.ManageLogisticDrivers)
  @SetPolicy(Action.Update, Resource.LogisticDrivers)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Driver>,
    @Body() update: UpdateDriverDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
