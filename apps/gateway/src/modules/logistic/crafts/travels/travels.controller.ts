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
import { TravelDataSerializer, TravelItemsSerializer, TravelSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateTravelDto, CreateTravelItemsDto, UpdateTravelDto } from '@app/common/dto/logistic';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Travel, TravelDto } from '@app/common/interfaces/logistic';
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

const COLL_PATH = COLLECTION('travels', 'logistic');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('logistic', 'travels')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TravelsController extends ControllerClass<Travel, TravelDto> implements IController<Travel, TravelDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.travels, TravelSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/travels', 'create')
  @ApiResponse({ type: TravelDataSerializer })
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  override create(@Meta() meta: Metadata, @Body() data: CreateTravelDto): Observable<TravelDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/travels', 'create')
  @ApiResponse({ type: TravelItemsSerializer })
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateTravelItemsDto): Observable<TravelItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @ApiResponse({ type: TravelItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Travel>): Observable<TravelItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: TravelSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Travel>) {
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
  @SetScope(Scope.ReadLogisticTravels)
  @ApiResponse({ type: TravelDataSerializer })
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Travel>): Observable<TravelDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @ApiResponse({ type: TravelDataSerializer })
  @SetPolicy(Action.Delete, Resource.LogisticTravels)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Travel>): Observable<TravelDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @ApiResponse({ type: TravelDataSerializer })
  @SetPolicy(Action.Restore, Resource.LogisticTravels)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Travel>): Observable<TravelDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @ApiResponse({ type: TravelDataSerializer })
  @SetPolicy(Action.Destroy, Resource.LogisticTravels)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Travel>): Observable<TravelDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @Validation('logistic/travels', 'update')
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Travel>,
    @Body() update: UpdateTravelDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @Validation('logistic/travels', 'update')
  @ApiResponse({ type: TravelDataSerializer })
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Travel>,
    @Body() update: UpdateTravelDto,
  ): Observable<TravelDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
