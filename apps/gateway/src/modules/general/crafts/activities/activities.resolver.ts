import { ActivityDataSerializer, ActivityItemsSerializer, ActivitySerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateActivityDto, CreateActivityItemsDto, UpdateActivityDto } from '@app/common/dto/general';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
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

@Resolver(() => ActivitySerializer)
@RateLimit('activities')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ActivitiesResolver extends ControllerClass<Activity, ActivityDto> implements IController<Activity, ActivityDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.activities, ActivitySerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Activities, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  countActivity(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralActivities)
  createActivity(@Meta() meta: Metadata, @Args('data') data: CreateActivityDto): Observable<ActivityDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ActivityItemsSerializer)
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralActivities)
  createActivityBulk(@Meta() meta: Metadata, @Args('data') data: CreateActivityItemsDto): Observable<ActivityItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ActivityItemsSerializer)
  @Cache(Collection.Activities, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findActivity(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Activity>): Observable<ActivityItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ActivityDataSerializer)
  @Cache(Collection.Activities, 'fill')
  @SetScope(Scope.ReadGeneralActivities)
  @SetPolicy(Action.Read, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @SetPolicy(Action.Delete, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @SetPolicy(Action.Restore, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ActivityDataSerializer)
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.ManageGeneralActivities)
  @SetPolicy(Action.Destroy, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyActivityById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Activity>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ActivityDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.ManageGeneralActivities)
  @SetPolicy(Action.Update, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateActivityBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateActivityDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Activity>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ActivityDataSerializer)
  @Cache(Collection.Activities, 'flush')
  @SetScope(Scope.WriteGeneralActivities)
  @SetPolicy(Action.Update, Resource.GeneralActivities)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateActivityById(
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
