import { GatewayInterceptors, WriteInterceptors, ResponseInterceptors } from '@app/common/core/interceptors';
import { StatDataSerializer, StatItemsSerializer, StatSerializer } from '@app/common/serializers/special';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateStatDto, CreateStatItemsDto, UpdateStatDto } from '@app/common/dto/special';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { SpecialProvider } from '@app/common/providers/special';
import { Stat, StatDto } from '@app/common/interfaces/special';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('stats', 'special');

@Resolver(() => StatSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsResolver extends ControllerClass<Stat, StatDto> implements IController<Stat, StatDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.stats, StatSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  countSpecialStat(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @Validation('special/stats', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  createSpecialStat(@Meta() meta: Metadata, @Args('data') data: CreateStatDto): Observable<StatDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => StatItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @Validation('special/stats', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  createSpecialStatBulk(@Meta() meta: Metadata, @Args('data') data: CreateStatItemsDto): Observable<StatItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => StatItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findSpecialStat(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Stat>): Observable<StatItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => StatDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findSpecialStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Delete, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteSpecialStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Restore, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreSpecialStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => StatDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Destroy, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroySpecialStatById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StatDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @Validation('special/stats', 'update')
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSpecialStatBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateStatDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Stat>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => StatDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @Validation('special/stats', 'update')
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSpecialStatById(
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
