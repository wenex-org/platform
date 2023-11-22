import {
  TotalSerializer,
  AppDataSerializer,
  AppItemsSerializer,
  AppSerializer,
} from '@app/common/serializers';
import {
  CreateAppDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateAppDto,
} from '@app/common/dto';
import {
  AuthorityInterceptor,
  FilterInterceptor,
  GatewayInterceptors,
  WriteInterceptors,
} from '@app/common/interceptors';
import {
  Controller as ControllerInterface,
  Metadata,
  App,
  AppDto,
} from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Cache, SetPolicy, SetScope } from '@app/common/metadatas';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { DomainProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => AppSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AppsResolver
  extends ControllerClass<App, AppDto>
  implements ControllerInterface<App, AppDto>
{
  constructor(readonly provider: DomainProvider) {
    super(provider.apps, () => AppSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('apps', 'fill')
  @SetScope(Scope.ReadDomainApps)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.DomainApps)
  countApp(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainApps)
  createApp(
    @Meta() meta: Metadata,
    @Args('data') data: CreateAppDto,
    @Session() session?: ClientSession,
  ): Observable<AppDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => AppItemsSerializer)
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainApps)
  createBulkApp(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateAppDto] }) items: CreateAppDto[],
    @Session() session?: ClientSession,
  ): Observable<AppItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => AppItemsSerializer)
  @Cache('apps', 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findApp(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<App>,
    @Session() session?: ClientSession,
  ): Observable<AppItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => AppDataSerializer)
  @Cache('apps', 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Delete, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Restore, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  @Cache('apps', 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Destroy, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<App>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Args('data') update: UpdateAppDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @Cache('apps', 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkApp(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<App>,
    @Args('data') update: UpdateAppDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
