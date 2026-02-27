import { ActivityDataSerializer, ActivityItemsSerializer, ActivitySerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateActivityDto, CreateActivityItemsDto, UpdateActivityDto } from '@app/common/dto/general';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Activity, ActivityDto } from '@app/common/interfaces/general';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { GeneralProvider } from '@app/common/providers/general';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('activities', 'general');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ActivitiesResolver extends ControllerClass<Activity, ActivityDto> implements IController<Activity, ActivityDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.activities, ActivitySerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  countGeneralActivity(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteGeneralActivities)
  @Validation('general/activities', 'create')
  @SetPolicy(Action.Create, Resource.GeneralActivities)
  createGeneralActivity(@Meta() meta: Metadata, @Args('data') data: CreateActivityDto): Observable<ActivityDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ActivityItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteGeneralActivities)
  @Validation('general/activities', 'create')
  @SetPolicy(Action.Create, Resource.GeneralActivities)
  createGeneralActivityBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateActivityItemsDto,
  ): Observable<ActivityItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ActivityItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findGeneralActivity(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Activity>,
  ): Observable<ActivityItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ActivityDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findGeneralActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @SetPolicy(Action.Delete, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteGeneralActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @SetPolicy(Action.Restore, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreGeneralActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralActivities)
  @SetPolicy(Action.Destroy, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyGeneralActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralActivities)
  @Validation('general/activities', 'update')
  @SetPolicy(Action.Update, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGeneralActivityBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateActivityDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Activity>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ActivityDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @Validation('general/activities', 'update')
  @SetPolicy(Action.Update, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGeneralActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Activity>,
    @Args('data') update: UpdateActivityDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
