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
import { CargoDataSerializer, CargoItemsSerializer, CargoSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateCargoDto, CreateCargoItemsDto, UpdateCargoDto } from '@app/common/dto/logistic';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { LogisticProvider } from '@app/common/providers/logistic';
import { Cargo, CargoDto } from '@app/common/interfaces/logistic';
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

const COLL_PATH = COLLECTION('cargoes', 'logistic');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('logistic', 'cargoes')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CargoesController extends ControllerClass<Cargo, CargoDto> implements IController<Cargo, CargoDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.cargoes, CargoSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/cargoes', 'create')
  @ApiResponse({ type: CargoDataSerializer })
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  override create(@Meta() meta: Metadata, @Body() data: CreateCargoDto): Observable<CargoDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/cargoes', 'create')
  @ApiResponse({ type: CargoItemsSerializer })
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateCargoItemsDto): Observable<CargoItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @ApiResponse({ type: CargoItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Cargo>): Observable<CargoItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: CargoSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Cargo>) {
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
  @SetScope(Scope.ReadLogisticCargoes)
  @ApiResponse({ type: CargoDataSerializer })
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Cargo>): Observable<CargoDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @ApiResponse({ type: CargoDataSerializer })
  @SetPolicy(Action.Delete, Resource.LogisticCargoes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Cargo>): Observable<CargoDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @ApiResponse({ type: CargoDataSerializer })
  @SetPolicy(Action.Restore, Resource.LogisticCargoes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Cargo>): Observable<CargoDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @ApiResponse({ type: CargoDataSerializer })
  @SetPolicy(Action.Destroy, Resource.LogisticCargoes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Cargo>): Observable<CargoDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @Validation('logistic/cargoes', 'update')
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Cargo>,
    @Body() update: UpdateCargoDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @Validation('logistic/cargoes', 'update')
  @ApiResponse({ type: CargoDataSerializer })
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Cargo>,
    @Body() update: UpdateCargoDto,
  ): Observable<CargoDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
