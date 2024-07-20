import { TotalSerializer, PushDataSerializer, PushItemsSerializer, PushSerializer } from '@app/common/serializers';
import { CreatePushDto, FilterDto, FilterOneDto, QueryFilterDto, UpdatePushDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Push, PushDto } from '@app/common/interfaces';
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

@Resolver(() => PushSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushResolver extends ControllerClass<Push, PushDto> implements ControllerInterface<Push, PushDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes, () => PushSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('push', 'fill')
  @SetScope(Scope.ReadTouchPush)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchPush)
  countPush(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => PushDataSerializer)
  @ShipStrategy('create')
  @Cache('push', 'flush')
  @SetScope(Scope.WriteTouchPush)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPush)
  createPush(
    @Meta() meta: Metadata,
    @Args('data') data: CreatePushDto,
    @Session() session?: ClientSession,
  ): Observable<PushDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => PushItemsSerializer)
  @ShipStrategy('create')
  @Cache('push', 'flush')
  @SetScope(Scope.WriteTouchPush)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPush)
  createBulkPush(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreatePushDto] }) items: CreatePushDto[],
    @Session() session?: ClientSession,
  ): Observable<PushItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => PushItemsSerializer)
  @Cache('push', 'fill')
  @SetScope(Scope.ReadTouchPush)
  @SetPolicy(Action.Read, Resource.TouchPush)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findPush(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Push>,
    @Session() session?: ClientSession,
  ): Observable<PushItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => PushDataSerializer)
  @Cache('push', 'fill')
  @SetScope(Scope.ReadTouchPush)
  @SetPolicy(Action.Read, Resource.TouchPush)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => PushDataSerializer)
  @Cache('push', 'flush')
  @SetScope(Scope.WriteTouchPush)
  @SetPolicy(Action.Delete, Resource.TouchPush)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => PushDataSerializer)
  @Cache('push', 'flush')
  @SetScope(Scope.WriteTouchPush)
  @SetPolicy(Action.Restore, Resource.TouchPush)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => PushDataSerializer)
  @Cache('push', 'flush')
  @SetScope(Scope.ManageTouchPush)
  @SetPolicy(Action.Destroy, Resource.TouchPush)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => PushDataSerializer)
  @ShipStrategy('update')
  @Cache('push', 'flush')
  @SetScope(Scope.WriteTouchPush)
  @SetPolicy(Action.Update, Resource.TouchPush)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Args('data') update: UpdatePushDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('push', 'flush')
  @SetScope(Scope.ManageTouchPush)
  @SetPolicy(Action.Update, Resource.TouchPush)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkPush(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Push>,
    @Args('data') update: UpdatePushDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
