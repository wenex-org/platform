import { SettingDataSerializer, SettingItemsSerializer, SettingSerializer } from '@app/common/serializers/context';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateSettingDto, CreateSettingItemsDto, UpdateSettingDto } from '@app/common/dto/context';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Setting, SettingDto } from '@app/common/interfaces/context';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { ContextProvider } from '@app/common/providers/context';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('settings', 'context');

@Resolver(() => SettingSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SettingsResolver extends ControllerClass<Setting, SettingDto> implements IController<Setting, SettingDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.settings, SettingSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContextSettings)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  countContextSetting(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextSettings)
  createContextSetting(@Meta() meta: Metadata, @Args('data') data: CreateSettingDto): Observable<SettingDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SettingItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextSettings)
  createContextSettingBulk(@Meta() meta: Metadata, @Args('data') data: CreateSettingItemsDto): Observable<SettingItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SettingItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContextSettings)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContextSetting(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Setting>,
  ): Observable<SettingItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SettingDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContextSettings)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContextSettingById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @SetPolicy(Action.Delete, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteContextSettingById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @SetPolicy(Action.Restore, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreContextSettingById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContextSettings)
  @SetPolicy(Action.Destroy, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyContextSettingById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContextSettings)
  @SetPolicy(Action.Update, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContextSettingBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSettingDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Setting>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @SetPolicy(Action.Update, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContextSettingById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Args('data') update: UpdateSettingDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
