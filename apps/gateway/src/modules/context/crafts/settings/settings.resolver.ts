import {
  CreateSettingDto,
  CreateSettingItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateSettingDto,
} from '@app/common/dto';
import { TotalSerializer, SettingDataSerializer, SettingItemsSerializer, SettingSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Setting, SettingDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ContextProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => SettingSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SettingsResolver extends ControllerClass<Setting, SettingDto> implements ControllerInterface<Setting, SettingDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.settings, () => SettingSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Settings, 'fill')
  @SetScope(Scope.ReadContextSettings)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  countSetting(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Settings, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextSettings)
  createSetting(@Meta() meta: Metadata, @Args('data') data: CreateSettingDto): Observable<SettingDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SettingItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Settings, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextSettings)
  createBulkSetting(@Meta() meta: Metadata, @Args('data') data: CreateSettingItemsDto): Observable<SettingItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SettingItemsSerializer)
  @Cache(Collection.Settings, 'fill')
  @SetScope(Scope.ReadContextSettings)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSetting(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Setting>): Observable<SettingItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SettingDataSerializer)
  @Cache(Collection.Settings, 'fill')
  @SetScope(Scope.ReadContextSettings)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(Collection.Settings, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @SetPolicy(Action.Delete, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(Collection.Settings, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @SetPolicy(Action.Restore, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache(Collection.Settings, 'flush')
  @SetScope(Scope.ManageContextSettings)
  @SetPolicy(Action.Destroy, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => SettingDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Settings, 'flush')
  @SetScope(Scope.WriteContextSettings)
  @SetPolicy(Action.Update, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Args('data') update: UpdateSettingDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Settings, 'flush')
  @SetScope(Scope.ManageContextSettings)
  @SetPolicy(Action.Update, Resource.ContextSettings)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkSetting(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Setting>,
    @Args('data') update: UpdateSettingDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
