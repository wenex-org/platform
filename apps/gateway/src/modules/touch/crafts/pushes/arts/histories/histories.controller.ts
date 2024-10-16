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
  PushHistoryDataSerializer,
  PushHistoryItemsSerializer,
  PushHistorySerializer,
} from '@app/common/serializers';
import {
  CreatePushHistoryDto,
  CreatePushHistoryItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdatePushHistoryDto,
} from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, PushHistory, PushHistoryDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@ApiTags(Collection.PushHistories)
@Controller(Collection.PushHistories)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushHistoriesController
  extends ControllerClass<PushHistory, PushHistoryDto>
  implements ControllerInterface<PushHistory, PushHistoryDto>
{
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes.histories, () => PushHistorySerializer);
  }

  @Get('count')
  @UseInterceptors(AuthorityInterceptor)
  @SetScope(Scope.ReadTouchPushHistories)
  @Cache(Collection.PushHistories, 'fill')
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  create(@Meta() meta: Metadata, @Body() data: CreatePushHistoryDto): Observable<PushHistoryDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  createBulk(@Meta() meta: Metadata, @Body() data: CreatePushHistoryItemsDto): Observable<PushHistoryItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadTouchPushHistories)
  @Cache(Collection.PushHistories, 'fill')
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<PushHistory>): Observable<PushHistoryItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchPushHistories)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<PushHistory>): Observable<PushHistorySerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @SetScope(Scope.ReadTouchPushHistories)
  @Cache(Collection.PushHistories, 'fill')
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Delete, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Restore, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.PushHistories, 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @SetPolicy(Action.Destroy, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Body() update: UpdatePushHistoryDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.PushHistories, 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<PushHistory>,
    @Body() update: UpdatePushHistoryDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
