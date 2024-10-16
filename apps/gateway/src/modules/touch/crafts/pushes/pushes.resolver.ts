import { CreatePushDto, CreatePushItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdatePushDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, PushDataSerializer, PushItemsSerializer, PushSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Push, PushDto } from '@app/common/interfaces';
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

@Resolver(() => PushSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PushesResolver extends ControllerClass<Push, PushDto> implements ControllerInterface<Push, PushDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.pushes, () => PushSerializer);
  }

  @Query(() => TotalSerializer)
  @SetScope(Scope.ReadTouchPushes)
  @Cache(Collection.Pushes, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchPushes)
  countPush(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteTouchPushes)
  @Cache(Collection.Pushes, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPushes)
  createPush(@Meta() meta: Metadata, @Args('data') data: CreatePushDto): Observable<PushDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => PushItemsSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteTouchPushes)
  @Cache(Collection.Pushes, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchPushes)
  createBulkPush(@Meta() meta: Metadata, @Args('data') data: CreatePushItemsDto): Observable<PushItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => PushItemsSerializer)
  @SetScope(Scope.ReadTouchPushes)
  @Cache(Collection.Pushes, 'fill')
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findPush(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Push>): Observable<PushItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => PushDataSerializer)
  @SetScope(Scope.ReadTouchPushes)
  @Cache(Collection.Pushes, 'fill')
  @SetPolicy(Action.Read, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @SetScope(Scope.WriteTouchPushes)
  @Cache(Collection.Pushes, 'flush')
  @SetPolicy(Action.Delete, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @SetScope(Scope.WriteTouchPushes)
  @Cache(Collection.Pushes, 'flush')
  @SetPolicy(Action.Restore, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @Cache(Collection.Pushes, 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @SetPolicy(Action.Destroy, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Push>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => PushDataSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.WriteTouchPushes)
  @Cache(Collection.Pushes, 'flush')
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOnePush(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Push>,
    @Args('data') update: UpdatePushDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<PushDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Pushes, 'flush')
  @SetScope(Scope.ManageTouchPushes)
  @SetPolicy(Action.Update, Resource.TouchPushes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkPush(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Push>,
    @Args('data') update: UpdatePushDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
