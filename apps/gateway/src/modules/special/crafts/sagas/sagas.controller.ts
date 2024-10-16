import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CreateSagaDto, CreateSagaItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateSagaDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, SagaDataSerializer, SagaItemsSerializer, SagaSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Saga, SagaDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Sagas)
@Controller(Collection.Sagas)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagasController extends ControllerClass<Saga, SagaDto> implements ControllerInterface<Saga, SagaDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.sagas, () => SagaSerializer);
  }

  @Get('count')
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadSpecialSagas)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialSagas)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialSagas)
  create(@Meta() meta: Metadata, @Body() data: CreateSagaDto): Observable<SagaDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialSagas)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateSagaItemsDto): Observable<SagaItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadSpecialSagas)
  @SetPolicy(Action.Read, Resource.SpecialSagas)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Saga>): Observable<SagaItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadSpecialSagas)
  @SetPolicy(Action.Read, Resource.SpecialSagas)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<Saga>): Observable<SagaSerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadSpecialSagas)
  @SetPolicy(Action.Read, Resource.SpecialSagas)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @SetPolicy(Action.Delete, Resource.SpecialSagas)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @SetPolicy(Action.Restore, Resource.SpecialSagas)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageSpecialSagas)
  @SetPolicy(Action.Destroy, Resource.SpecialSagas)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @SetPolicy(Action.Update, Resource.SpecialSagas)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Body() update: UpdateSagaDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageSpecialSagas)
  @SetPolicy(Action.Update, Resource.SpecialSagas)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Saga>,
    @Body() update: UpdateSagaDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
