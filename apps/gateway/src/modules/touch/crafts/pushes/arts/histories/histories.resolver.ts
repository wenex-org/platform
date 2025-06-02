import { PusHistoryDataSerializer, PusHistoryItemsSerializer, PusHistorySerializer } from '@app/common/serializers/touch';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreatePusHistoryDto, CreatePusHistoryItemsDto, UpdatePusHistoryDto } from '@app/common/dto/touch';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { PusHistory, PusHistoryDto } from '@app/common/interfaces/touch';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('push-histories', 'touch');

@Resolver(() => PusHistorySerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PusHistoriesResolver
  extends ControllerClass<PusHistory, PusHistoryDto>
  implements IController<PusHistory, PusHistoryDto>
{
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes.histories, PusHistorySerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPusHistories)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchPusHistories)
  countPusHistory(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => PusHistoryDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPusHistories)
  createPusHistory(@Meta() meta: Metadata, @Args('data') data: CreatePusHistoryDto): Observable<PusHistoryDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => PusHistoryItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPusHistories)
  createPusHistoryBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreatePusHistoryItemsDto,
  ): Observable<PusHistoryItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => PusHistoryItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPusHistories)
  @SetPolicy(Action.Read, Resource.TouchPusHistories)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findPusHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<PusHistory>,
  ): Observable<PusHistoryItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => PusHistoryDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPusHistories)
  @SetPolicy(Action.Read, Resource.TouchPusHistories)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findPusHistoryById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PusHistory>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PusHistoryDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => PusHistoryDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @SetPolicy(Action.Delete, Resource.TouchPusHistories)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deletePusHistoryById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PusHistory>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PusHistoryDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => PusHistoryDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @SetPolicy(Action.Restore, Resource.TouchPusHistories)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restorePusHistoryById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PusHistory>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PusHistoryDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => PusHistoryDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchPusHistories)
  @SetPolicy(Action.Destroy, Resource.TouchPusHistories)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyPusHistoryById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PusHistory>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PusHistoryDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchPusHistories)
  @SetPolicy(Action.Update, Resource.TouchPusHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updatePusHistoryBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdatePusHistoryDto,
    @Filter() @Args('filter') filter: QueryFilterDto<PusHistory>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => PusHistoryDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPusHistories)
  @SetPolicy(Action.Update, Resource.TouchPusHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updatePusHistoryById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PusHistory>,
    @Args('data') update: UpdatePusHistoryDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PusHistoryDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
