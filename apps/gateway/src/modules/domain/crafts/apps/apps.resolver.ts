import { Cache, Nested, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { AppDataSerializer, AppItemsSerializer, AppSerializer } from '@app/common/serializers/domain';
import { CreateAppDto, CreateAppItemsDto, UpdateAppDto } from '@app/common/dto/domain';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
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

@Resolver(() => AppSerializer)
@RateLimit('apps')
@Nested<App>('change_logs')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AppsResolver extends ControllerClass<App, AppDto> implements IController<App, AppDto> {
  constructor(readonly provider: DomainProvider) {
    super(provider.apps, AppSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Apps, 'fill')
  @SetScope(Scope.ReadDomainApps)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.DomainApps)
  countApp(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainApps)
  createApp(@Meta() meta: Metadata, @Args('data') data: CreateAppDto): Observable<AppDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => AppItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainApps)
  createAppBulk(@Meta() meta: Metadata, @Args('data') data: CreateAppItemsDto): Observable<AppItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => AppItemsSerializer)
  @Cache(Collection.Apps, 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findApp(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<App>): Observable<AppItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => AppDataSerializer)
  @Cache(Collection.Apps, 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Delete, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Restore, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Destroy, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyAppById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AppDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateAppBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateAppDto,
    @Filter() @Args('filter') filter: QueryFilterDto<App>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => AppDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateAppById(
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
