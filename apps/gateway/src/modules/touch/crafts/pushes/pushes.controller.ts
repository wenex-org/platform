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
import { CreatePushDto, CreatePushItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdatePushDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, PushDataSerializer, PushItemsSerializer, PushSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Push, PushDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('pushes')
@Controller('pushes')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushesController extends ControllerClass<Push, PushDto> implements ControllerInterface<Push, PushDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes, () => PushSerializer);
  }

  @Get('count')
  @Cache('pushes', 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('pushes', 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPushes)
  create(@Meta() meta: Metadata, @Body() data: CreatePushDto, @Session() session?: ClientSession): Observable<PushDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('pushes', 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPushes)
  createBulk(
    @Meta() meta: Metadata,
    @Body() data: CreatePushItemsDto,
    @Session() session?: ClientSession,
  ): Observable<PushItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Get()
  @Cache('pushes', 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
  ): Observable<PushItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchPushes)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
  ): Observable<PushSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('pushes', 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('pushes', 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @SetPolicy(Action.Delete, Resource.TouchPushes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('pushes', 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @SetPolicy(Action.Restore, Resource.TouchPushes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('pushes', 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @SetPolicy(Action.Destroy, Resource.TouchPushes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('pushes', 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Body() update: UpdatePushDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('pushes', 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Push>,
    @Body() update: UpdatePushDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
