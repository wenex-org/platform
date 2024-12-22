import { StatDataSerializer, StatItemsSerializer, StatSerializer } from '@app/common/serializers/essential';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateStatDto, CreateStatItemsDto, UpdateStatDto } from '@app/common/dto/essential';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { EssentialProvider } from '@app/common/providers/essential';
import { Stat, StatDto } from '@app/common/interfaces/essential';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => StatSerializer)
@RateLimit('stats')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsResolver extends ControllerClass<Stat, StatDto> implements IController<Stat, StatDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.stats, StatSerializer);
  }

  @Query(() => TotalSerializer)
  @SetScope(Scope.ReadEssentialStats)
  @Cache(Collection.Stats, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialStats)
  countStat(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EssentialStats)
  createStat(@Meta() meta: Metadata, @Args('data') data: CreateStatDto): Observable<StatDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => StatItemsSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EssentialStats)
  createStatBulk(@Meta() meta: Metadata, @Args('data') data: CreateStatItemsDto): Observable<StatItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => StatItemsSerializer)
  @SetScope(Scope.ReadEssentialStats)
  @Cache(Collection.Stats, 'fill')
  @SetPolicy(Action.Read, Resource.EssentialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findStat(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Stat>): Observable<StatItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => StatDataSerializer)
  @SetScope(Scope.ReadEssentialStats)
  @Cache(Collection.Stats, 'fill')
  @SetPolicy(Action.Read, Resource.EssentialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @SetPolicy(Action.Delete, Resource.EssentialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @SetPolicy(Action.Restore, Resource.EssentialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @SetScope(Scope.ManageEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @SetPolicy(Action.Destroy, Resource.EssentialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.ManageEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @SetPolicy(Action.Update, Resource.EssentialStats)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateStatBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateStatDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Stat>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => StatDataSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.WriteEssentialStats)
  @Cache(Collection.Stats, 'flush')
  @SetPolicy(Action.Update, Resource.EssentialStats)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Args('data') update: UpdateStatDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
