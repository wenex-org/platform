import { MetricDataSerializer, MetricItemsSerializer, MetricSerializer } from '@app/common/serializers/thing';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateMetricDto, CreateMetricItemsDto, UpdateMetricDto } from '@app/common/dto/thing';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Metric, MetricDto } from '@app/common/interfaces/thing';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { ThingProvider } from '@app/common/providers/thing';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('metrics', 'thing');

@Resolver(() => MetricSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MetricsResolver extends ControllerClass<Metric, MetricDto> implements IController<Metric, MetricDto> {
  constructor(readonly provider: ThingProvider) {
    super(provider.metrics, MetricSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingMetrics)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ThingMetrics)
  countThingMetric(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => MetricDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingMetrics)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/metrics', 'create')
  @SetPolicy(Action.Create, Resource.ThingMetrics)
  createThingMetric(@Meta() meta: Metadata, @Args('data') data: CreateMetricDto): Observable<MetricDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => MetricItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingMetrics)
  @UseInterceptors(...WriteInterceptors)
  @Validation('thing/metrics', 'create')
  @SetPolicy(Action.Create, Resource.ThingMetrics)
  createThingMetricBulk(@Meta() meta: Metadata, @Args('data') data: CreateMetricItemsDto): Observable<MetricItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => MetricItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingMetrics)
  @SetPolicy(Action.Read, Resource.ThingMetrics)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findThingMetric(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Metric>): Observable<MetricItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => MetricDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadThingMetrics)
  @SetPolicy(Action.Read, Resource.ThingMetrics)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findThingMetricById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Metric>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MetricDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => MetricDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingMetrics)
  @SetPolicy(Action.Delete, Resource.ThingMetrics)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteThingMetricById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Metric>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MetricDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => MetricDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingMetrics)
  @SetPolicy(Action.Restore, Resource.ThingMetrics)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreThingMetricById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Metric>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MetricDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => MetricDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingMetrics)
  @SetPolicy(Action.Destroy, Resource.ThingMetrics)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyThingMetricById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Metric>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MetricDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageThingMetrics)
  @Validation('thing/metrics', 'update')
  @SetPolicy(Action.Update, Resource.ThingMetrics)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateThingMetricBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateMetricDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Metric>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => MetricDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteThingMetrics)
  @Validation('thing/metrics', 'update')
  @SetPolicy(Action.Update, Resource.ThingMetrics)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateThingMetricById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Metric>,
    @Args('data') update: UpdateMetricDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MetricDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
