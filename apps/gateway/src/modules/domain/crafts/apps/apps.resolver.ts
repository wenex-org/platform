import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Cache, Nested, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { AppDataSerializer, AppItemsSerializer, AppSerializer } from '@app/common/serializers/domain';
import { CreateAppDto, CreateAppItemsDto, UpdateAppDto } from '@app/common/dto/domain';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
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
import { DomainProvider } from '@app/common/providers/domain';
import { App, AppDto } from '@app/common/interfaces/domain';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('apps', 'domain');

@Resolver(() => AppSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@Nested<App>('change_logs')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AppsResolver extends ControllerClass<App, AppDto> implements IController<App, AppDto> {
  constructor(readonly provider: DomainProvider) {
    super(provider.apps, AppSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadDomainApps)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.DomainApps)
  countDomainApp(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @Validation('domain/apps', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainApps)
  createDomainApp(@Meta() meta: Metadata, @Args('data') data: CreateAppDto): Observable<AppDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => AppItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @Validation('domain/apps', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainApps)
  createDomainAppBulk(@Meta() meta: Metadata, @Args('data') data: CreateAppItemsDto): Observable<AppItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => AppItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findDomainApp(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<App>): Observable<AppItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => AppDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findDomainAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Delete, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteDomainAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Restore, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreDomainAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Destroy, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyDomainAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageDomainApps)
  @Validation('domain/apps', 'update')
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateDomainAppBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateAppDto,
    @Filter() @Args('filter') filter: QueryFilterDto<App>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @Validation('domain/apps', 'update')
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateDomainAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Args('data') update: UpdateAppDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
