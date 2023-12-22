import {
  TotalSerializer,
  StatDataSerializer,
  StatItemsSerializer,
  StatSerializer,
} from '@app/common/serializers';
import {
  CreateStatDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateStatDto,
} from '@app/common/dto';
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
  AuthorityInterceptor,
  FilterInterceptor,
  GatewayInterceptors,
  WriteInterceptors,
} from '@app/common/interceptors';
import {
  Controller as ControllerInterface,
  Metadata,
  Stat,
  StatDto,
} from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('stats')
@Controller('stats')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsController
  extends ControllerClass<Stat, StatDto>
  implements ControllerInterface<Stat, StatDto>
{
  constructor(readonly provider: SpecialProvider) {
    super(provider.stats, () => StatSerializer);
  }

  @Get('count')
  @Cache('stats', 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateStatDto,
    @Session() session?: ClientSession,
  ): Observable<StatDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @ApiBody({ type: [CreateStatDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateStatDto[],
    @Session() session?: ClientSession,
  ): Observable<StatItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('stats', 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
  ): Observable<StatItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
  ): Observable<StatSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('stats', 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: FilterOneDto, required: false })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Delete, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Restore, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('stats', 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Destroy, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Body() update: UpdateStatDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('stats', 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Stat>,
    @Body() update: UpdateStatDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
