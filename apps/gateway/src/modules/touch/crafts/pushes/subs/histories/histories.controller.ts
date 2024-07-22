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
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { CreatePushHistoryDto, FilterDto, FilterOneDto, QueryFilterDto, UpdatePushHistoryDto } from '@app/common/dto';
import { Controller as ControllerInterface, Metadata, PushHistory, PushHistoryDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('push-histories')
@Controller('push-histories')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
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
  @Cache('push-histories', 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetScope(Scope.ReadTouchPushHistories)
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('push-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreatePushHistoryDto,
    @Session() session?: ClientSession,
  ): Observable<PushHistoryDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('push-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @ApiBody({ type: [CreatePushHistoryDto] })
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreatePushHistoryDto[],
    @Session() session?: ClientSession,
  ): Observable<PushHistoryItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('push-histories', 'fill')
  @SetScope(Scope.ReadTouchPushHistories)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
  ): Observable<PushHistoryItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchPushHistories)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
  ): Observable<PushHistorySerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('push-histories', 'fill')
  @SetScope(Scope.ReadTouchPushHistories)
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('push-histories', 'flush')
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Delete, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('push-histories', 'flush')
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Restore, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('push-histories', 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @SetPolicy(Action.Destroy, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('push-histories', 'flush')
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Body() update: UpdatePushHistoryDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('push-histories', 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<PushHistory>,
    @Body() update: UpdatePushHistoryDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
