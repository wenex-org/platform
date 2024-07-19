import {
  TotalSerializer,
  PushHistoryDataSerializer,
  PushHistoryItemsSerializer,
  PushHistorySerializer,
} from '@app/common/serializers';
import { CreatePushHistoryDto, FilterDto, FilterOneDto, QueryFilterDto, UpdatePushHistoryDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, PushHistory, PushHistoryDto } from '@app/common/interfaces';
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
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => PushHistorySerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushHistoryResolver
  extends ControllerClass<PushHistory, PushHistoryDto>
  implements ControllerInterface<PushHistory, PushHistoryDto>
{
  constructor(readonly provider: TouchProvider) {
    super(provider.push.histories, () => PushHistorySerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('push-histories', 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetScope(Scope.ReadTouchPushHistories)
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  countPushHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @ShipStrategy('create')
  @Cache('push-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  createPushHistory(
    @Meta() meta: Metadata,
    @Args('data') data: CreatePushHistoryDto,
    @Session() session?: ClientSession,
  ): Observable<PushHistoryDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => PushHistoryItemsSerializer)
  @ShipStrategy('create')
  @Cache('push-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Create, Resource.TouchPushHistories)
  createBulkPushHistory(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreatePushHistoryDto] }) items: CreatePushHistoryDto[],
    @Session() session?: ClientSession,
  ): Observable<PushHistoryItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => PushHistoryItemsSerializer)
  @Cache('push-histories', 'fill')
  @SetScope(Scope.ReadTouchPushHistories)
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findPushHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
  ): Observable<PushHistoryItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => PushHistoryDataSerializer)
  @Cache('push-histories', 'fill')
  @SetScope(Scope.ReadTouchPushHistories)
  @SetPolicy(Action.Read, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @Cache('push-histories', 'flush')
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Delete, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @Cache('push-histories', 'flush')
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Restore, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @Cache('push-histories', 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @SetPolicy(Action.Destroy, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<PushHistory>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => PushHistoryDataSerializer)
  @ShipStrategy('update')
  @Cache('push-histories', 'flush')
  @SetScope(Scope.WriteTouchPushHistories)
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOnePushHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<PushHistory>,
    @Args('data') update: UpdatePushHistoryDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('push-histories', 'flush')
  @SetScope(Scope.ManageTouchPushHistories)
  @SetPolicy(Action.Update, Resource.TouchPushHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkPushHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<PushHistory>,
    @Args('data') update: UpdatePushHistoryDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
