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
import { SagaStageDataSerializer, SagaStageItemsSerializer, SagaStageSerializer } from '@app/common/serializers/essential';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateSagaStageDto, CreateSagaStageItemsDto, UpdateSagaStageDto } from '@app/common/dto/essential';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { SagaStage, SagaStageDto } from '@app/common/interfaces/essential';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { EssentialProvider } from '@app/common/providers/essential';
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

const COLL_PATH = COLLECTION('saga-stages', 'essential');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@ApiTags('essential', 'saga-stages')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagaStagesController extends ControllerClass<SagaStage, SagaStageDto> implements IController<SagaStage, SagaStageDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.sagas.stages, SagaStageSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteEssentialSagaStages)
  @Validation('essential/saga-stages', 'create')
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Create, Resource.EssentialSagaStages)
  override create(@Meta() meta: Metadata, @Body() data: CreateSagaStageDto): Observable<SagaStageDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteEssentialSagaStages)
  @Validation('essential/saga-stages', 'create')
  @ApiResponse({ type: SagaStageItemsSerializer })
  @SetPolicy(Action.Create, Resource.EssentialSagaStages)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateSagaStageItemsDto): Observable<SagaStageItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiResponse({ type: SagaStageItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadEssentialSagaStages)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: SagaStageSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<SagaStage>) {
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
  @SetScope(Scope.ReadEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Delete, Resource.EssentialSagaStages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Restore, Resource.EssentialSagaStages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Destroy, Resource.EssentialSagaStages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEssentialSagaStages)
  @Validation('essential/saga-stages', 'update')
  @SetPolicy(Action.Update, Resource.EssentialSagaStages)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<SagaStage>,
    @Body() update: UpdateSagaStageDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @Validation('essential/saga-stages', 'update')
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Update, Resource.EssentialSagaStages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaStage>,
    @Body() update: UpdateSagaStageDto,
  ): Observable<SagaStageDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
