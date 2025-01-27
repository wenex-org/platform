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
  SagaDataSerializer,
  SagaItemsSerializer,
  SagaSerializer,
  SagaStageDataSerializer,
  SagaStageSerializer,
} from '@app/common/serializers/essential';
import { AddSagaStageDto, CreateSagaDto, CreateSagaItemsDto, StartSagaDto, UpdateSagaDto } from '@app/common/dto/essential';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { TransformerPipe, ValidationPipe } from '@app/common/core/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { EssentialProvider } from '@app/common/providers/essential';
import { Saga, SagaDto } from '@app/common/interfaces/essential';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable } from 'rxjs';
import { Response } from 'express';

@ApiBearerAuth()
@RateLimit('sagas')
@ApiTags(Collection.Sagas)
@Controller(Collection.Sagas)
@UseFilters(AllExceptionsFilter)
@UsePipes(TransformerPipe, ValidationPipe)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagasController extends ControllerClass<Saga, SagaDto> implements IController<Saga, SagaDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.sagas, SagaSerializer);
  }

  @Post('start')
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.StartEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Start, Resource.EssentialSagas)
  start(@Meta() meta: Metadata, @Body() data: StartSagaDto): Observable<SagaDataSerializer> {
    return from(this.provider.sagas.start(data, { meta })).pipe(mapToInstance(SagaSerializer, 'data'));
  }

  @Post('add')
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.AddEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Add, Resource.EssentialSagas)
  add(@Meta() meta: Metadata, @Body() data: AddSagaStageDto): Observable<SagaStageDataSerializer> {
    return from(this.provider.sagas.add(data, { meta })).pipe(mapToInstance(SagaStageSerializer, 'data'));
  }

  @Get(':id/abort')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.AbortEssentialSagas)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Abort, Resource.EssentialSagas)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  abort(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Saga>): Observable<SagaDataSerializer> {
    return from(this.provider.sagas.abort(filter, { meta })).pipe(mapToInstance(SagaSerializer, 'data'));
  }

  @Get(':id/commit')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.CommitEssentialSagas)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Commit, Resource.EssentialSagas)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  commit(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Saga>): Observable<SagaDataSerializer> {
    return from(this.provider.sagas.commit(filter, { meta })).pipe(mapToInstance(SagaSerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Create, Resource.EssentialSagas)
  override create(@Meta() meta: Metadata, @Body() data: CreateSagaDto): Observable<SagaDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SagaItemsSerializer })
  @SetPolicy(Action.Create, Resource.EssentialSagas)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateSagaItemsDto): Observable<SagaItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @ApiResponse({ type: SagaItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Saga>): Observable<SagaItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadEssentialSagas)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: SagaSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Saga>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getSseMessage({ id: data.id, data })),
      error: (data) => res.end(getSseMessage({ event: 'error', data })),
      complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Saga>): Observable<SagaDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Delete, Resource.EssentialSagas)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Saga>): Observable<SagaDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Restore, Resource.EssentialSagas)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Saga>): Observable<SagaDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageEssentialSagas)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Destroy, Resource.EssentialSagas)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Saga>): Observable<SagaDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageEssentialSagas)
  @SetPolicy(Action.Update, Resource.EssentialSagas)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Saga>,
    @Body() update: UpdateSagaDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @ApiResponse({ type: SagaDataSerializer })
  @SetPolicy(Action.Update, Resource.EssentialSagas)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Body() update: UpdateSagaDto,
  ): Observable<SagaDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
