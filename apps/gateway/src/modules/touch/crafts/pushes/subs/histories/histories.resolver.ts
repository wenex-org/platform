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
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => PushHistorySerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushHistoriesResolver
  extends ControllerClass<PushHistory, PushHistoryDto>
  implements ControllerInterface<PushHistory, PushHistoryDto>
{
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes.histories, () => PushHistorySerializer);
  }

  @Query(() => TotalSerializer)
  @UseInterceptors(AuthorityInterceptor)
  @SetScope(Scope.ReadTouchPushHistories)
  @Cache(Collection.PushHistories, 'fill')
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  countPushHistory(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  createPushHistory(@Meta() meta: Metadata, @Args('data') data: CreatePushHistoryDto): Observable<PushHistoryDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => PushHistoryItemsSerializer)
  @ShipStrategy('create')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  createBulkPushHistory(
    @Meta() meta: Metadata,
    @Args('data') data: CreatePushHistoryItemsDto,
  ): Observable<PushHistoryItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => PushHistoryItemsSerializer)
  @SetScope(Scope.ReadTouchPushHistories)
  @Cache(Collection.PushHistories, 'fill')
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findPushHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<PushHistory>,
  ): Observable<PushHistoryItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => PushHistoryDataSerializer)
  @SetScope(Scope.ReadTouchPushHistories)
  @Cache(Collection.PushHistories, 'fill')
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Delete, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Restore, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @Cache(Collection.PushHistories, 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @SetPolicy(Action.Destroy, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.WriteTouchPushHistories)
  @Cache(Collection.PushHistories, 'flush')
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Args('data') update: UpdatePushHistoryDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.PushHistories, 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkPushHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<PushHistory>,
    @Args('data') update: UpdatePushHistoryDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
