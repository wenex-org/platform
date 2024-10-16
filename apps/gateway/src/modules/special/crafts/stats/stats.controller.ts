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
import { CreateStatDto, CreateStatItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateStatDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, StatDataSerializer, StatItemsSerializer, StatSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Stat, StatDto } from '@app/common/interfaces';
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
@ApiTags(Collection.Stats)
@Controller(Collection.Stats)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsController extends ControllerClass<Stat, StatDto> implements ControllerInterface<Stat, StatDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.stats, () => StatSerializer);
  }

  @Get('count')
  @Cache(Collection.Stats, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  create(@Meta() meta: Metadata, @Body() data: CreateStatDto): Observable<StatDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateStatItemsDto): Observable<StatItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Stats, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<Stat>): Observable<StatSerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @Cache(Collection.Stats, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Delete, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Restore, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Destroy, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Body() update: UpdateStatDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Stats, 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Stat>,
    @Body() update: UpdateStatDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
