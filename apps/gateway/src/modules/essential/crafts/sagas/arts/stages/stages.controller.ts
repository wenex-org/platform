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
import { CreateSagaStageDto, CreateSagaStageItemsDto, UpdateSagaStageDto } from '@app/common/dto/essential';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { SagaStage, SagaStageDto } from '@app/common/interfaces/essential';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { EssentialProvider } from '@app/common/providers/essential';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('saga-stages')
@UsePipes(ValidationPipe)
@ApiTags(Collection.SagaStages)
@Controller(Collection.SagaStages)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagaStagesController extends ControllerClass<SagaStage, SagaStageDto> implements IController<SagaStage, SagaStageDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.sagas.stages, SagaStageSerializer);
  }

  @Get('count')
  @Cache(Collection.SagaStages, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Create, Resource.EssentialSagaStages)
  override create(@Meta() meta: Metadata, @Body() data: CreateSagaStageDto): Observable<SagaStageDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SagaStageItemsSerializer })
  @SetPolicy(Action.Create, Resource.EssentialSagaStages)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateSagaStageItemsDto): Observable<SagaStageItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.SagaStages, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiResponse({ type: SagaStageItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadEssentialSagaStages)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: SagaStageSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<SagaStage>) {
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
  @Cache(Collection.SagaStages, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Delete, Resource.EssentialSagaStages)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Restore, Resource.EssentialSagaStages)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.ManageEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Destroy, Resource.EssentialSagaStages)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaStage>): Observable<SagaStageDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.ManageEssentialSagaStages)
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
  @ShipStrategy('update')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @ApiResponse({ type: SagaStageDataSerializer })
  @SetPolicy(Action.Update, Resource.EssentialSagaStages)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaStage>,
    @Body() update: UpdateSagaStageDto,
  ): Observable<SagaStageDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
