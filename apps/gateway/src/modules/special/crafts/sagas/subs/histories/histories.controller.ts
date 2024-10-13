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
import {
  TotalSerializer,
  SagaHistoryDataSerializer,
  SagaHistoryItemsSerializer,
  SagaHistorySerializer,
} from '@app/common/serializers';
import {
  CreateSagaHistoryDto,
  CreateSagaHistoryItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateSagaHistoryDto,
} from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, SagaHistory, SagaHistoryDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('saga-histories')
@Controller('saga-histories')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagaHistoriesController
  extends ControllerClass<SagaHistory, SagaHistoryDto>
  implements ControllerInterface<SagaHistory, SagaHistoryDto>
{
  constructor(readonly provider: SpecialProvider) {
    super(provider.sagas.histories, () => SagaHistorySerializer);
  }

  @Get('count')
  @Cache('saga-histories', 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetScope(Scope.ReadSpecialSagaHistories)
  @SetPolicy(Action.Read, Resource.SpecialSagaHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('saga-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Create, Resource.SpecialSagaHistories)
  create(@Meta() meta: Metadata, @Body() data: CreateSagaHistoryDto): Observable<SagaHistoryDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('saga-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Create, Resource.SpecialSagaHistories)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateSagaHistoryItemsDto): Observable<SagaHistoryItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache('saga-histories', 'fill')
  @SetScope(Scope.ReadSpecialSagaHistories)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaHistory>): Observable<SagaHistoryItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadSpecialSagaHistories)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<SagaHistory>): Observable<SagaHistorySerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @Cache('saga-histories', 'fill')
  @SetScope(Scope.ReadSpecialSagaHistories)
  @SetPolicy(Action.Read, Resource.SpecialSagaHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Delete, Resource.SpecialSagaHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Restore, Resource.SpecialSagaHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.ManageSpecialSagaHistories)
  @SetPolicy(Action.Destroy, Resource.SpecialSagaHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Update, Resource.SpecialSagaHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaHistory>,
    @Body() update: UpdateSagaHistoryDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.ManageSpecialSagaHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @SetPolicy(Action.Update, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<SagaHistory>,
    @Body() update: UpdateSagaHistoryDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
