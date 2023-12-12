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
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => StatSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StatsResolver
  extends ControllerClass<Stat, StatDto>
  implements ControllerInterface<Stat, StatDto>
{
  constructor(readonly provider: SpecialProvider) {
    super(provider.stats, () => StatSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('stats', 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  countStat(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => StatDataSerializer)
  @ShipStrategy('create')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  createStat(
    @Meta() meta: Metadata,
    @Args('data') data: CreateStatDto,
    @Session() session?: ClientSession,
  ): Observable<StatDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => StatItemsSerializer)
  @ShipStrategy('create')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialStats)
  createBulkStat(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateStatDto] }) items: CreateStatDto[],
    @Session() session?: ClientSession,
  ): Observable<StatItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => StatItemsSerializer)
  @Cache('stats', 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findStat(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
  ): Observable<StatItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => StatDataSerializer)
  @Cache('stats', 'fill')
  @SetScope(Scope.ReadSpecialStats)
  @SetPolicy(Action.Read, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneStat(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => StatDataSerializer)
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Delete, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneStat(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => StatDataSerializer)
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Restore, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneStat(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => StatDataSerializer)
  @Cache('stats', 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Destroy, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneStat(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Stat>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => StatDataSerializer)
  @ShipStrategy('update')
  @Cache('stats', 'flush')
  @SetScope(Scope.WriteSpecialStats)
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneStat(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Stat>,
    @Args('data') update: UpdateStatDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<StatDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('stats', 'flush')
  @SetScope(Scope.ManageSpecialStats)
  @SetPolicy(Action.Update, Resource.SpecialStats)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkStat(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Stat>,
    @Args('data') update: UpdateStatDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
