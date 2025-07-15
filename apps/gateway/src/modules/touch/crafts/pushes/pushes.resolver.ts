import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { PushDataSerializer, PushItemsSerializer, PushSerializer } from '@app/common/serializers/touch';
import { CreatePushDto, CreatePushItemsDto, UpdatePushDto } from '@app/common/dto/touch';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { Push, PushDto } from '@app/common/interfaces/touch';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('pushes', 'touch');

@Resolver(() => PushSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushesResolver extends ControllerClass<Push, PushDto> implements IController<Push, PushDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes, PushSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  countTouchPush(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPushes)
  createTouchPush(@Meta() meta: Metadata, @Args('data') data: CreatePushDto): Observable<PushDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => PushItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPushes)
  createTouchPushBulk(@Meta() meta: Metadata, @Args('data') data: CreatePushItemsDto): Observable<PushItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => PushItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTouchPush(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Push>): Observable<PushItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => PushDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchPushes)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTouchPushById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PushDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @SetPolicy(Action.Delete, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteTouchPushById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PushDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @SetPolicy(Action.Restore, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreTouchPushById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PushDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @SetPolicy(Action.Destroy, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyTouchPushById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PushDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTouchPushBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdatePushDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Push>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => PushDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchPushes)
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTouchPushById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Args('data') update: UpdatePushDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PushDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
