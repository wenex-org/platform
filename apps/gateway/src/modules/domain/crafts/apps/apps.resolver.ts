import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { CreateAppDto, CreateAppItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateAppDto } from '@app/common/dto';
import { TotalSerializer, AppDataSerializer, AppItemsSerializer, AppSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, App, AppDto } from '@app/common/interfaces';
import { Cache, Nested, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { DomainProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => AppSerializer)
@UsePipes(ValidationPipe)
@Nested<App>('change_logs')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AppsResolver extends ControllerClass<App, AppDto> implements ControllerInterface<App, AppDto> {
  constructor(readonly provider: DomainProvider) {
    super(provider.apps, () => AppSerializer);
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
  createBulkApp(@Meta() meta: Metadata, @Args('data') data: CreateAppItemsDto): Observable<AppItemsSerializer> {
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
  findOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Delete, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Restore, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Destroy, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => AppDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Args('data') update: UpdateAppDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Apps, 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkApp(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<App>,
    @Args('data') update: UpdateAppDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
